import { FilterSearch } from "@components/common/Inputs/Search";
import PageContainer from "@components/common/PageContainer";
import { ArrowCircleDownIcon } from "@heroicons/react/solid";
import {Dispatch, SetStateAction, useEffect, useState} from "react";
import {fetchClub, fetchMembers} from "@client/fetcher/panel";
import {useAuth} from "@client/auth";
import Router from "next/router";
import {useToast} from "@components/common/Toast/ToastContext";
import {clubMap} from "@config/clubMap";
import {ListElement} from "@components/panel/element/ListElement";
import {searchKeyword, sortNumber, sortThaiDictionary} from "@utilities/object";
import {isNumeric} from "@utilities/texts";
const fetchMemberData = async (panelID: string, setMemberData: Dispatch<SetStateAction<{}>>, setToast, reFetch) => {
  const data = await fetchMembers(panelID, false)
  let sorted = {
    m4: [],
    m5: [],
    m6: []
  }

  if (data.status) {
    data.data.forEach((item) => {
      console.log(item)
      if (item.level === "4") {
        sorted.m4.push(item)
      }
      if (item.level === "5") {
        sorted.m5.push(item)
      }
      if (item.level === "6") {
        sorted.m6.push(item)
      }
    })
    setMemberData(sorted)
  }else{
    switch (data.report) {
      case "sessionError":
        setToast({
          theme:"modern",
          icon: "cross",
          title: "พบข้อผิดพลาดของเซสชั่น",
          text: "กรุณาลองเข้าสู่ระบบใหม่อีกครั้ง",
          crossPage: true
        })
        reFetch()
        break
      case "invalidPermission":
        setToast({
          theme:"modern",
          icon: "cross",
          title: "คุณไม่ได้รับอนุญาตในการกระทำนี้",
          text: "กรุณาลองเข้าสู่ระบบใหม่อีกครั้งหรือ หากยังไม่สามารถแก้ไขได้ให้ติดต่อทาง กช."
        })
        break
    }
  }
}

const fetchClubData = async (clubID: string, setClubData: Dispatch<SetStateAction<{}>>) => {
  const data = await fetchClub(clubID)
  setClubData(data)
}


const Report = () => {

  const {addToast} = useToast()

  const {onReady, reFetch} = useAuth()
  const [sortMode, setSortMode] = useState("ascending")
  const [searchContext, setSearchContext] = useState("")
  const [rawSorted, setRawSorted] = useState([])
  const [sortedData, setSortedData] = useState([])

  const [memberData, setMemberData] = useState({
    m4: [],
    m5: [],
    m6: []
  })

  const [clubData, setClubData] = useState({new_count: 0, new_count_limit: 0,old_count: 0, old_count_limit: 0, call_count: 0})

  const userData = onReady((logged, userData) => {
    if (!logged) {
      Router.push("/auth");
      return userData
    }
    if (!("panelID" in userData) || userData.panelID.length <= 0) {
      Router.push("/select");
      return userData
    }
    return userData
  })

  const refetch = () => {
    const currentID = localStorage.getItem("currentPanel") || userData.panelID[0]

    fetchMemberData(currentID, setMemberData, addToast, reFetch)
    fetchClubData(currentID, setClubData)
  }

  useEffect(() => {
    applySort()
  },[sortMode, memberData])


  const applySort = () => {
    const data = [...memberData.m4,...memberData.m5,...memberData.m6]

    switch (sortMode) {
      case "ascending": {
        const sorted = sortThaiDictionary( data, obj => (obj.firstname))
        setRawSorted(sorted)
      }
        break
      case "descending": {
        const sorted = sortThaiDictionary(data, obj => (obj.firstname), true)
        setRawSorted(sorted)
      }
        break
      case "nascending": {
        const sorted = sortNumber(data, obj => (obj.student_id))
        setRawSorted(sorted)
      }
        break
      case "ndescending": {
        const sorted = sortNumber(data, obj => (obj.student_id), true)
        setRawSorted(sorted)
      }
        break
    }
  }

  useEffect(() => {
    if (userData && userData.panelID) {
      refetch()
    }
  }, [userData])

  useEffect(() => {
    const escaped = searchContext.replace(/ /g,"")
    if (escaped !== "") {
      let searchResult;

      if(isNumeric(escaped)){
        searchResult = searchKeyword(rawSorted, escaped, (obj) => (obj.student_id))
      }else{
        searchResult = searchKeyword(rawSorted, escaped, (obj) => (obj.firstname + obj.lastname))
      }

      setSortedData(searchResult)
    } else {
      setSortedData(rawSorted)
    }
  }, [searchContext, rawSorted])

  return (
    <PageContainer>
      <div className="max-w-6xl pt-10 mx-auto pb-14">
        <h1 className="text-2xl font-medium text-center">สมาชิกชมรม</h1>
        <div className="flex justify-center">
          <div className="absolute w-full px-4 pt-8">
            <div className="flex justify-center max-w-xl mx-auto bg-white border border-gray-300 rounded-lg shadow-md ">
              <div className="flex justify-end w-full h-full">
                <div className="flex justify-center w-full py-[0.54rem] overflow-clip overflow-hidden">
                  <h1 className="text-xl text-TUCMC-gray-600 whitespace-nowrap">
                    {userData && ("panelID" in userData && clubMap[localStorage.getItem("currentPanel")])}
                  </h1>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="w-screen px-4 pt-16 pb-20 mx-auto bg-TUCMC-gray-100">
        <div className="flex flex-col mx-auto space-y-4 md:max-w-4xl">
          <div className="flex flex-col space-y-4 md:space-y-0 md:justify-center md:space-x-4 md:w-full md:flex-row">
            <div className="flex flex-col items-center justify-center bg-white rounded-lg px-4 py-3.5 text-TUCMC-gray-600 shadow-md text-xl md:w-1/3">
              <div className="flex flex-col items-center justify-center space-y-2">
                <div>สมาชิกทั้งหมด</div>
                <div className="flex flex-row items-end">
                  <h1 className="text-3xl font-bold text-TUCMC-gray-900">{clubData.old_count + clubData.new_count}</h1>
                  <h2 className="text-TUCMC-gray-500">/{clubData.old_count_limit + clubData.new_count_limit}</h2>
                </div>
                <div>คน</div>
              </div>
            </div>
            <div className="flex flex-row items-center  justify-center bg-white rounded-lg px-4 py-3.5 text-TUCMC-gray-600  shadow-md text-xl md:w-2/3 divide-gray-300 divide-x-2">
              <div className="flex items-center justify-center w-full py-2 ">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div>สมาชิกเก่า</div>
                  <div className="flex flex-row items-end">
                    <h1 className="text-3xl font-bold text-TUCMC-gray-900">
                      {clubData.old_count}
                    </h1>
                    <h2 className="text-TUCMC-gray-500">/{clubData.old_count_limit}</h2>
                  </div>
                  <div>คน</div>
                </div>
              </div>
              <div className="flex items-center justify-center w-full py-2">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div>สมาชิกใหม่</div>
                  <div className="flex flex-row items-end">
                    <h1 className="text-3xl font-bold text-TUCMC-gray-900">
                      {clubData.new_count}
                    </h1>
                    <h2 className="text-TUCMC-gray-500">/{clubData.new_count_limit}</h2>
                  </div>
                  <div>คน</div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex">
            <div className="flex flex-row items-center justify-center bg-white rounded-lg px-4 py-3.5 text-TUCMC-gray-600 shadow-md text-xl w-full divide-gray-300 divide-x-2">
              <div className="flex items-center justify-center w-full py-2">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div>ม.4</div>
                  <div className="flex ">
                    <h1 className="text-3xl font-bold text-TUCMC-gray-900">
                      {memberData.m4.length}
                    </h1>
                  </div>
                  <div>คน</div>
                </div>
              </div>
              <div className="flex items-center justify-center w-full py-2">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div>ม.5</div>
                  <div className="flex ">
                    <h1 className="text-3xl font-bold text-TUCMC-gray-900">
                      {memberData.m5.length}
                    </h1>
                  </div>
                  <div>คน</div>
                </div>
              </div>
              <div className="flex items-center justify-center w-full py-2">
                <div className="flex flex-col items-center justify-center space-y-2">
                  <div>ม.6</div>
                  <div className="flex">
                    <h1 className="text-3xl font-bold text-TUCMC-gray-900">
                      {memberData.m6.length}
                    </h1>
                  </div>
                  <div>คน</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl mx-auto">
        <div className="relative flex justify-center">
          <div className="absolute w-full px-4 pb-8 -top-8">
            <div className="flex items-center justify-center max-w-md p-5 mx-auto space-x-2 bg-white border border-gray-300 rounded-md cursor-not-allowed text-TUCMC-gray-700">
              <ArrowCircleDownIcon className="w-5 h-5" />
              <span>ดาวน์โหลดรายชื่อสมาชิก</span>
            </div>
          </div>
        </div>
      </div>
      <div className="max-w-6xl pt-10 mx-auto pb-14">
        <h1 className="pt-16 pb-10 text-xl text-center text-TUCMC-gray-700">
          รายชื่อ
        </h1>
        <div className="flex flex-col items-center">
          <div className="w-full max-w-sm md:max-w-xl">
            <FilterSearch setSearchContext={setSearchContext} setSortMode={setSortMode} sortMode={sortMode} normal={false}/>
          </div>
          <div className="w-full max-w-5xl mt-6 mb-6">
            {sortedData.map((item, index) => {
              return <ListElement key={`report-${index}`} userData={item} editable={false} editFunc={() => {}} noStatus={true}/>
            })}
          </div>
        </div>
      </div>
    </PageContainer>
  );
};

export default Report;
