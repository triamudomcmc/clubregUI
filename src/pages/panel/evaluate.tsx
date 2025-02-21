import React, { useEffect, useRef, useState } from "react"
import { getAllAttendanceData, getEvaluationData, submitEval } from "@init/evaluate"
import PageContainer from "@components/common/PageContainer"
import { useAuth } from "@client/auth"
import { fetchMembers } from "@client/fetcher/panel"
import Router from "next/router"
import FingerprintJS from "@fingerprintjs/fingerprintjs"
import {
  CheckIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  EyeIcon,
  EyeOffIcon,
  MinusSmIcon,
  XIcon,
} from "@heroicons/react/solid"
import { EvalCheck } from "@components/panel/element/EvalCheck"
import { Button } from "@components/common/Inputs/Button"
import classnames from "classnames"
import { Ellipsis } from "@vectors/Loaders/Ellipsis"
import { useToast } from "@components/common/Toast/ToastContext"
import { clubMap } from "@config/clubMap"
import Modal from "@components/common/Modals"
import { useWindowDimensions } from "@utilities/document"
import { Loader } from "@components/common/Loader"

const Evaluate = () => {
  const { onReady, reFetch } = useAuth()

  const [checks, setChecks] = useState([])
  const [member, setMembers] = useState([])
  const [pendingUpdate, setPendingUpdate] = useState({})
  const [accept, setAccept] = useState(false)
  const [pending, setPending] = useState(false)
  const [pinned, setPinned] = useState(false)
  const box = useRef(null)
  const clubsTrigger = useRef(null)
  const [closeBox, setCloseBox] = useState(false)
  const [loading, setLoading] = useState(true)
  const [boxSize, setBoxSize] = useState(0)
  const [adArr, setAdArr] = useState([])
  const { width } = useWindowDimensions()

  const { addToast } = useToast()

  useEffect(() => {
    // Router.push("/panel")
  }, [])

  const ignored = [
    new Date("2024-11-04T00:00:00.00").getTime().toString(),
    new Date("2024-12-16T00:00:00.00").getTime().toString(),
    new Date("2024-12-23T00:00:00.00").getTime().toString(),
    new Date("2024-12-30T00:00:00.00").getTime().toString(),
    new Date("2025-01-27T00:00:00.00").getTime().toString(),
  ]

  const month = {
    1: "ม.ค.",
    2: "ก.พ.",
    3: "มี.ค.",
    4: "เม.ย",
    5: "พ.ค.",
    6: "มิ.ย.",
    7: "ก.ค.",
    8: "ส.ค.",
    9: "ก.ย.",
    10: "ต.ค.",
    11: "พ.ย.",
    12: "ธ.ค.",
  }

  const userData = onReady((logged, userData) => {
    if (!logged) return Router.push("/auth")

    if (!("panelID" in userData) || userData.panelID.length <= 0) {
      Router.push("/account")
    }

    return userData
  })

  useEffect(() => {
    if (box.current) {
      setBoxSize(box.current?.clientWidth)
    }
  }, [box, width])

  useEffect(() => {
    if ("panelID" in userData) {
      const i = [...userData.panelID]
      const index = userData.panelID.indexOf(localStorage.getItem("currentPanel"))
      if (index > -1) {
        i.splice(index, 1)
      }
      setAdArr(i)
    }
  }, [userData])

  const setCurrentPanel = (id) => {
    localStorage.setItem("currentPanel", id)
    Router.reload()
    setCloseBox(true)
  }

  const submitEvalData = async () => {
    const currentID = localStorage.getItem("currentPanel") || userData.panelID[0]
    setPending(true)

    if (!accept) {
      addToast({
        theme: "modern",
        icon: "cross",
        title: "กรุณากดยืนยันว่าข้อมูลทั้งหมดได้รับการตรวจสอบจากครูที่ปรึกษาแล้ว",
        text: "กรุณากดยืนยันว่าข้อมูลทั้งหมดได้รับการตรวจสอบจากครูที่ปรึกษาแล้วทุกครั้งก่อนส่งข้อมูล",
      })
      setPending(false)
      return
    }

    if (Object.keys(pendingUpdate).length < member.length) {
      addToast({
        theme: "modern",
        icon: "cross",
        title: "ข้อมูลที่จะอัปเดทไม่ถูกต้อง",
        text: "กรุณาเลือกสถานะให้สมาชิกทั้งหมดก่อนกดส่งข้อมูล",
      })
      setPending(false)
      return
    }

    const fp = await FingerprintJS.load()
    const fingerPrint = await fp.get()
    const res = await submitEval.call({ panelID: currentID, fp: fingerPrint.visitorId, data: pendingUpdate })
    if (res.status) {
      addToast({
        theme: "modern",
        icon: "tick",
        title: "อัปเดทข้อมูลสำเร็จแล้ว",
        text: "ข้อมูลที่ถูกส่งไป ได้รับการอัปเดทบนฐานข้อมูลแล้ว",
      })
    } else {
      switch (res.report) {
        case "sessionError":
          addToast({
            theme: "modern",
            icon: "cross",
            title: "พบข้อผิดพลาดของเซสชั่น",
            text: "กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง",
            crossPage: true,
          })
          reFetch()
          break
        case "invalidPermission":
          addToast({
            theme: "modern",
            icon: "cross",
            title: "คุณไม่ได้รับอนุญาตในการกระทำนี้",
            text: "กรุณาลองเข้าสู่ระบบใหม่อีกครั้งหรือ หากยังไม่สามารถแก้ไขได้ให้ติดต่อทาง กช.",
          })
          break
      }
    }
    setPending(false)
  }

  const fetch = async () => {
    setLoading(true)
    const panelID = localStorage.getItem("currentPanel") || userData.panelID[0]
    const fp = await FingerprintJS.load()
    const fingerPrint = await fp.get()
    const res = await getAllAttendanceData.call({ panelID: panelID, fp: fingerPrint.visitorId })
    const member = await fetchMembers(panelID, false)

    res.data && setChecks(res.data.sort((a, b) => parseInt(a.date) - parseInt(b.date)))
    member.data &&
      setMembers(
        member.data
          .filter((data) => !data.student_id.includes("ก"))
          .sort((a, b) => parseInt(a.room) - parseInt(b.room) || parseInt(a.number) - parseInt(b.number))
      )

    const evalData = await getEvaluationData.call({ panelID: panelID, fp: fingerPrint.visitorId })
    evalData.data && setPendingUpdate(evalData.data)
    setLoading(false)
  }

  useEffect(() => {
    if (userData.panelID) {
      let currPanel = localStorage.getItem("currentPanel")

      if (userData.panelID && (!currPanel || currPanel === "")) {
        currPanel = userData.panelID[0]
        localStorage.setItem("currentPanel", currPanel)
      }

      fetch()
    }
  }, [userData])

  return (
    <PageContainer>
      <Loader display={loading} />
      <div className="flex min-h-screen w-full flex-col items-center py-10 px-6">
        <h1 className="mb-2 text-center text-4xl text-TUCMC-gray-900">ประเมินผล</h1>
        <p className="text-center text-TUCMC-gray-700">กรรมการชมรมจะต้องประเมินผลนักเรียนทุกคนให้เสร็จ</p>
        <p className="mb-2 text-center text-TUCMC-gray-700">ภายในวันอังคาร ที่ 25 กุมภาพันธ์ 2568</p>
        <div className="mb-10 w-full max-w-[400px]">
          <div
            ref={box}
            className="relative mx-auto flex max-w-xl justify-center rounded-lg border border-gray-300 bg-white shadow-sm"
          >
            <div className="flex h-full w-full justify-end">
              <div className="flex w-full justify-center overflow-hidden overflow-clip py-[0.54rem]">
                <span className="whitespace-nowrap text-TUCMC-gray-600">
                  {userData && "panelID" in userData && clubMap[localStorage.getItem("currentPanel")]}
                </span>
              </div>
              <div
                ref={clubsTrigger}
                className={classnames(
                  "flex w-12 cursor-pointer items-center justify-center border-l border-gray-300",
                  !(userData.panelID && userData.panelID.length > 1) && "hidden"
                )}
              >
                <ChevronDownIcon className="h-6 w-6 text-gray-500" />
              </div>
            </div>
            <Modal
              TriggerRef={clubsTrigger}
              CloseDep={{
                dep: closeBox,
                revert: () => {
                  setCloseBox(false)
                },
              }}
              className="absolute left-[-1px] top-[-5px] z-10 mx-auto mt-1 rounded-lg border border-gray-300 shadow-md"
            >
              <div className="flex h-full justify-end rounded-t-lg bg-white">
                <div className="flex w-full justify-center overflow-hidden overflow-clip py-[0.54rem]">
                  <span className="whitespace-nowrap text-TUCMC-gray-600">
                    {userData && "panelID" in userData && clubMap[localStorage.getItem("currentPanel")]}
                  </span>
                </div>
                <div
                  id="clubsClose"
                  className="flex w-12 cursor-pointer items-center justify-center border-l border-gray-300"
                >
                  <ChevronUpIcon className="h-6 w-6 text-gray-500" />
                </div>
              </div>
              <div style={{ width: `${boxSize}px` }} className="w-full rounded-b-lg bg-white pb-1">
                {adArr &&
                  adArr.map((val) => {
                    return (
                      <h1
                        key={val}
                        onClick={() => {
                          setCurrentPanel(val)
                        }}
                        className="cursor-pointer truncate whitespace-nowrap border-t py-[0.54rem] px-4 text-center text-TUCMC-gray-600 hover:bg-gray-100"
                      >
                        {clubMap[val]}
                      </h1>
                    )
                  })}
              </div>
            </Modal>
          </div>
        </div>
        <div className="flex w-full justify-center">
          {pinned && (
            <div className="flex flex-shrink-0 flex-col">
              <div className="flex items-center space-x-4 rounded-tl-lg border-l border-b border-t bg-gray-100 py-2 pl-4">
                <h1 className="font-medium">ชื่อ นามสกุล</h1>
                <EyeOffIcon
                  onClick={() => {
                    setPinned(false)
                  }}
                  className="h-5 w-5 cursor-pointer text-TUCMC-gray-700"
                />
              </div>
              {member.map((people) => {
                return (
                  <span className="flex h-10 items-center border-l border-b pl-4">
                    {people.title}
                    {people.firstname} {people.lastname}
                  </span>
                )
              })}
            </div>
          )}
          <div className="flex flex-row overflow-x-scroll pb-4">
            {!pinned && (
              <div className="flex flex-shrink-0 flex-col">
                <div className="flex items-center space-x-4 rounded-tl-lg border-l border-b border-t bg-gray-100 py-2 pl-4">
                  <h1 className="font-medium">ชื่อ นามสกุล</h1>
                  <EyeIcon
                    onClick={() => {
                      setPinned(true)
                    }}
                    className="h-5 w-5 cursor-pointer text-TUCMC-gray-700"
                  />
                </div>
                {member.map((people) => {
                  return (
                    <span className="flex h-10 items-center border-l border-b pl-4">
                      {people.title}
                      {people.firstname} {people.lastname}
                    </span>
                  )
                })}
              </div>
            )}
            <div className="flex flex-shrink-0 flex-col">
              <h1 className="border-b border-t bg-gray-100 py-2 px-4 text-center font-medium">ห้อง</h1>
              {member.map((people) => {
                return <span className="flex h-10 items-center justify-center border-b px-4">{people.room}</span>
              })}
            </div>
            <div className="flex flex-shrink-0 flex-col">
              <h1 className="border-b border-t bg-gray-100 py-2 px-4 text-center font-medium">เลขที่</h1>
              {member.map((people) => {
                return <span className="flex h-10 items-center justify-center border-b px-4">{people.number}</span>
              })}
            </div>
            {checks.map((data) => {
              const date = new Date(parseInt(data.date))
              if (ignored.includes(data.date)) {
                return (
                  <div className="flex w-16 flex-shrink-0 flex-col">
                    <h1 className="border-t border-b bg-gray-100 py-2 font-medium">
                      {date.getDate()} {month[date.getMonth() + 1]}
                    </h1>
                    {member.map(() => {
                      return (
                        <span className="flex h-10 items-center justify-center border-b">
                          {" "}
                          <MinusSmIcon className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-md bg-TUCMC-gray-500 text-white" />
                        </span>
                      )
                    })}
                  </div>
                )
              }

              return (
                <div className="flex w-16 flex-shrink-0 flex-col">
                  <h1 className="border-t border-b bg-gray-100 py-2 font-medium">
                    {date.getDate()} {month[date.getMonth() + 1]}
                  </h1>
                  {member.map((people) => {
                    let status = false

                    if (data.data) {
                      if (people.student_id in data.data) {
                        if (data.data[people.student_id].action === "passed") {
                          status = true
                        }
                      }
                    }

                    return (
                      <span className="flex h-10 items-center justify-center border-b">
                        {status ? (
                          <CheckIcon className="h-5 w-5 flex-shrink-0 rounded-md bg-TUCMC-green-400 p-[2px] text-white" />
                        ) : (
                          <XIcon className="h-5 w-5 flex-shrink-0 rounded-md bg-TUCMC-red-400 p-[2px] text-white" />
                        )}
                      </span>
                    )
                  })}
                </div>
              )
            })}
            <div className="flex flex-shrink-0 flex-col">
              <h1 className="border-t border-b bg-gray-100 py-2 text-center font-medium ">
                สรุป ({checks.length - ignored.length})
              </h1>
              {member.map((people) => {
                return (
                  <span className="flex h-10 items-center justify-center border-b">
                    {checks.reduce((prev, curr) => {
                      let cons = 0
                      let status = false

                      if (curr.data && people.student_id in curr.data) {
                        if (curr.data[people.student_id].action === "passed") {
                          cons = 1
                          status = true // Set status to true if "passed"
                        }
                      }

                      // If date is ignored and status is true, deduct from count
                      if (ignored.includes(curr.date) && status) {
                        return prev + cons - 1 // Subtract 1 if the date is ignored and the status is true
                      }

                      return prev + cons
                    }, 0)}
                  </span>
                )
              })}
            </div>
            <div className="flex flex-shrink-0 flex-col">
              <h1 className="rounded-tr-lg border-t border-r border-b bg-gray-100 py-2 px-4 text-center font-medium">
                ประเมินผล
              </h1>
              {member.map((people, i) => {
                return (
                  <span key={`check${i}`} className="flex h-10 items-center justify-center border-b border-r px-4">
                    <EvalCheck
                      key={`checke${i}`}
                      userData={people}
                      pendingUpdate={pendingUpdate}
                      setPendingUpdate={setPendingUpdate}
                    />
                  </span>
                )
              })}
            </div>
          </div>
        </div>
        <div className="mb-20 mt-8 flex flex-col items-center space-y-4">
          <div className="flex flex-row">
            <input
              className="mr-2 h-6 w-6 rounded-md border border-gray-200 ring-0"
              onChange={(e) => {
                setAccept(e.target.checked)
              }}
              type="checkbox"
              required
            />
            <span className="text-gray-700">ข้อมูลทั้งหมดได้รับการตรวจสอบจากครูที่ปรึกษาแล้ว</span>
          </div>
          <Button
            disabled={pending}
            onClick={!pending && submitEvalData}
            className={classnames(
              "rounded-full bg-TUCMC-pink-400 px-10 text-white",
              !pending ? "py-3" : "cursor-default py-[8px]"
            )}
          >
            <span className={classnames(pending && "hidden")}>ส่งผลการประเมิน</span>
            <Ellipsis className={classnames("h-8 w-[6.2rem]", !pending && "hidden")} />
          </Button>
        </div>
      </div>
    </PageContainer>
  )
}

export default Evaluate
