import { GetServerSideProps, GetStaticPaths, GetStaticProps } from "next"
import * as fs from "fs"
import path from "path"
import { FC, KeyboardEvent, useEffect, useRef, useState } from "react"
import { ChevronDownIcon, ClipboardCopyIcon, StarIcon } from "@heroicons/react/solid"
import PageContainer from "@components/common/PageContainer"
import Image from "next/image"
import { CameraIcon, CheckIcon, GlobeAltIcon, TrashIcon, UserIcon, XIcon } from "@heroicons/react/outline"
import { PencilIcon } from "@heroicons/react/solid"
import { isEmpty } from "@utilities/object"
import { useWindowDimensions } from "@utilities/document"
import Router, { useRouter } from "next/router"
import classnames from "classnames"
import ClubSkeleton from "@components/clubs/ClubSkeleton"
import Modal from "@components/common/Modals"
import { useAuth } from "@handlers/client/auth"
import { useToast } from "@components/common/Toast/ToastContext"
import { QuillEditor } from "@components/common/TextEdit/Quill"
import { StatusText } from "@components/panel/table/TableRow"
import { request } from "@handlers/client/utilities/request"
import { motion } from "framer-motion"
import { EditableZoomable } from "@components/common/Zoomable/editable"
import { toBase64 } from "@utilities/files"
import initialisedDB from "@server/firebase-admin"
import { removeItem } from "@utilities/array"
import { Ellipsis } from "@vectors/Loaders/Ellipsis"

const parseText = (text) => {
  return "<p>" + text.replace(/\n{2,}/g, "</p><p>").replace(/\n/g, "<br>")
}

const ClubHeaderCard = ({ clubID, data, status, contactRef, onLoad, publish, image, setImage, newImages, contact, setContact }) => {
  const [publishing, setPublishing] = useState(false)
  const uploader = useRef(null)
  const doUpload = async (e) => {
    const data = await toBase64(e.target.files[0])
    //@ts-ignore
    setImage(data)
  }

  const avail = [
    "FB",
    "IG",
    "Twitter",
    "YT",
    "Line",
  ]

  return (
    <div className="md:mx-6 md:mt-20 md:mb-2">
      <div className="flex items-center justify-between space-x-4 px-2 py-4">
        <div className="flex items-center space-x-4">
          <span>สถานะ:</span>
          <StatusText status={status} />
        </div>
        <div>
          <button
            onClick={async () => {
              setPublishing(true)
              await publish()
              setPublishing(false)
            }}
            className="rounded-full bg-TUCMC-pink-400 px-8 py-2 text-white transition-colors hover:bg-TUCMC-pink-500"
          >
            {publishing ? <Ellipsis className="h-6 w-[2.4rem]" /> : "ส่งการแก้ไข"}
          </button>
        </div>
      </div>

      <div className="md:flex md:space-x-8 md:rounded-2xl md:bg-white md:shadow-md">
        <div className={classnames("relative md:max-w-[512px]", image ? "mb-[0px]" : "mb-[-6.5px]")}>
          <div>
            {!image ? (
              <Image
                priority={true}
                onLoad={onLoad}
                src={"mainImage" in newImages ? newImages["mainImage"] : `/assets/thumbnails/${clubID}.jpg`}
                placeholder="blur"
                blurDataURL={"mainImage" in newImages ? newImages["mainImage"] : `/assets/thumbnails/${clubID}.jpg`}
                width="768"
                height="432"
                quality={75}
                className={classnames("object-cover md:rounded-l-2xl")}
              />
            ) : (
              <img
                src={image}
                className={classnames("mb-[0px] h-full object-cover sm:h-[288px] md:rounded-l-2xl")}
                width="768"
                height="432"
              />
            )}
          </div>
          <input
            className="hidden"
            ref={uploader}
            onChange={doUpload}
            type="file"
            accept="image/png, image/jpeg, image/heif"
          />
          <motion.div onClick={() => {uploader.current.click()}} initial={{opacity: 0}} whileHover={{opacity: 1}} className="absolute text-white flex justify-center sm:rounded-l-2xl bg-TUCMC-gray-800 bg-opacity-70 items-center w-full h-full sm:h-[288px] cursor-pointer top-0">
            <CameraIcon className="w-12 h-12"/>
          </motion.div>
        </div>
        <div className="flex">
          <div className="hidden h-2 w-6 md:block"></div>
          <div className="pl-6 pr-12 md:pl-0">
            <div className="h-6 w-full md:h-[1.8vw]"></div>
            <div className="space-y-5">
              <div>
                <h1 className="min-w-[150px] text-xl">ชมรม{data.nameTH}</h1>
                <h1 className="text-TUCMC-gray-600">{data.nameEN}</h1>
              </div>
              <div className="space-y-1">
                {data.audition ? (
                  <div className="flex space-x-2 text-TUCMC-pink-400">
                    <StarIcon className="h-6 w-6" />
                    <span>มีการ Audition</span>
                  </div>
                ) : (
                  <div className="flex space-x-2 text-TUCMC-blue-400">
                    <ClipboardCopyIcon className="h-6 w-6" />
                    <span>ไม่มีการ Audition</span>
                  </div>
                )}
                <div className="flex space-x-2 text-TUCMC-gray-600">
                  <UserIcon className="h-6 w-6" />
                  <span>สมาชิก {data.count} คน</span>
                </div>
                <div className="flex space-x-2 text-TUCMC-gray-600">
                  <GlobeAltIcon className="h-6 w-6" />
                  <div className="hidden md:block lg:hidden">
                    <a ref={contactRef} className="flex cursor-pointer items-center space-x-2">
                      <h1 className="whitespace-nowrap">ช่องทางการติดตาม</h1>
                      <ChevronDownIcon className="h-5 w-5" />
                    </a>
                    <Modal
                      TriggerRef={contactRef}
                      overlayClassName="flex justify-end"
                      className="absolute z-20 mt-1 w-[300px] rounded-lg bg-white px-4 py-3 shadow-md"
                    >
                      <div className="flex flex-col">
                      {!isEmpty(contact.contact) && (
                          <h1>
                            <select onChange={(e) => {
                              setContact(prev => ({
                                ...prev,
                                contact: {
                                  type: e.target.value,
                                  context: prev.contact.context
                                }
                              }))
                            }} className="outline-none border-none focus:border-none focus:outline-none pl-0">
                              <option value={contact.contact.type}>{contact.contact.type}</option>
                              {
                                avail.filter((a) => (contact.contact.type !== a)).map((i,k) => {
                                  return (
                                    <option key={`opt-${k}`} value={i}>{i}</option>
                                  )
                                })
                              }
                              </select> : <span onKeyUpCapture={(e) => {
                              setContact(prev => ({
                                ...prev,
                                contact: {
                                  type: prev.contact.type,
                                  context: e.target.innerText
                                }
                              }))
                            }} contentEditable={true}>{contact.contact.context}</span>
                          </h1>
                        )}
                        {!isEmpty(contact.contact2) && (
                          <h1>
                            <select onChange={(e) => {
                              setContact(prev => ({
                                ...prev,
                                contact: {
                                  type: e.target.value,
                                  context: prev.contact2.context
                                }
                              }))
                            }} className="outline-none border-none focus:border-none focus:outline-none pl-0">
                              <option value={contact.contact2.type}>{contact.contact2.type}</option>
                              {
                                avail.filter((a) => (contact.contact2.type !== a)).map((i,k) => {
                                  return (
                                    <option key={`opt-${k}`} value={i}>{i}</option>
                                  )
                                })
                              }
                              </select> : <span onKeyUpCapture={(e) => {
                              setContact(prev => ({
                                ...prev,
                                contact2: {
                                  type: prev.contact2.type,
                                  context: e.target.innerText
                                }
                              }))
                            }} contentEditable={true}>{contact.contact2.context}</span>
                          </h1>
                        )}
                        {!isEmpty(contact.contact3) && (
                          <h1>
                            <select onChange={(e) => {
                              setContact(prev => ({
                                ...prev,
                                contact3: {
                                  type: e.target.value,
                                  context: prev.contact3.context
                                }
                              }))
                            }} className="outline-none border-none focus:border-none focus:outline-none pl-0">
                              <option value={contact.contact3.type}>{contact.contact3.type}</option>
                              {
                                avail.filter((a) => (contact.contact3.type !== a)).map((i,k) => {
                                  return (
                                    <option key={`opt-${k}`} value={i}>{i}</option>
                                  )
                                })
                              }
                              </select> : <span onKeyUpCapture={(e) => {
                              setContact(prev => ({
                                ...prev,
                                contact3: {
                                  type: prev.contact3.type,
                                  context: e.target.innerText
                                }
                              }))
                            }} contentEditable={true}>{contact.contact3.context}</span>
                          </h1>
                        )}
                      </div>
                    </Modal>
                  </div>
                  <div className="flex flex-col md:hidden lg:block">
                  {!isEmpty(contact.contact) && (
                          <h1>
                            <select onChange={(e) => {
                              setContact(prev => ({
                                ...prev,
                                contact: {
                                  type: e.target.value,
                                  context: prev.contact.context
                                }
                              }))
                            }} className="outline-none border-none focus:border-none focus:outline-none pl-0">
                              <option value={contact.contact.type}>{contact.contact.type}</option>
                              {
                                avail.filter((a) => (contact.contact.type !== a)).map((i,k) => {
                                  return (
                                    <option key={`opt-${k}`} value={i}>{i}</option>
                                  )
                                })
                              }
                              </select> : <span onKeyUpCapture={(e) => {
                              setContact(prev => ({
                                ...prev,
                                contact: {
                                  type: prev.contact.type,
                                  context: e.target.innerText
                                }
                              }))
                            }} contentEditable={true}>{contact.contact.context}</span>
                          </h1>
                        )}
                        {!isEmpty(contact.contact2) && (
                          <h1>
                            <select onChange={(e) => {
                              setContact(prev => ({
                                ...prev,
                                contact: {
                                  type: e.target.value,
                                  context: prev.contact2.context
                                }
                              }))
                            }} className="outline-none border-none focus:border-none focus:outline-none pl-0">
                              <option value={contact.contact2.type}>{contact.contact2.type}</option>
                              {
                                avail.filter((a) => (contact.contact2.type !== a)).map((i,k) => {
                                  return (
                                    <option key={`opt-${k}`} value={i}>{i}</option>
                                  )
                                })
                              }
                              </select> : <span onKeyUpCapture={(e) => {
                              setContact(prev => ({
                                ...prev,
                                contact2: {
                                  type: prev.contact2.type,
                                  context: e.target.innerText
                                }
                              }))
                            }} contentEditable={true}>{contact.contact2.context}</span>
                          </h1>
                        )}
                        {!isEmpty(contact.contact3) && (
                          <h1>
                            <select onChange={(e) => {
                              setContact(prev => ({
                                ...prev,
                                contact3: {
                                  type: e.target.value,
                                  context: prev.contact3.context
                                }
                              }))
                            }} className="outline-none border-none focus:border-none focus:outline-none pl-0">
                              <option value={contact.contact3.type}>{contact.contact3.type}</option>
                              {
                                avail.filter((a) => (contact.contact3.type !== a)).map((i,k) => {
                                  return (
                                    <option key={`opt-${k}`} value={i}>{i}</option>
                                  )
                                })
                              }
                              </select> : <span onKeyUpCapture={(e) => {
                              setContact(prev => ({
                                ...prev,
                                contact3: {
                                  type: prev.contact3.type,
                                  context: e.target.innerText
                                }
                              }))
                            }} contentEditable={true}>{contact.contact3.context}</span>
                          </h1>
                        )}
                  </div>
                </div>
              </div>
            </div>
            <div className="h-10 w-full md:h-[2vw]"></div>
          </div>
        </div>
      </div>
    </div>
  )
}

const MainArticle: FC<{ value: string; setValue: any }> = ({ value, setValue }) => {
  return (
    <div className="w-full">
      <QuillEditor value={value} onChange={setValue} />

      {/* <div className="ql-bubble ql-container">
        <div className="ql-editor" dangerouslySetInnerHTML={{__html: value}}>

        </div>
      </div> */}
    </div>
  )
}

const SummaryImages = ({ images, onLoad, clubID, setImageS }) => {
  return (
    <div className="space-y-8 md:flex md:justify-center md:space-y-0 md:space-x-4">
      {images.map((name, index) => {
        if (name.includes("picture"))
          return (
            <div key={`picture-${index}`}>
              <EditableZoomable
                priority={true}
                onLoad={onLoad}
                className="rounded-lg object-cover"
                src={`/assets/images/clubs/${clubID}/${name}`}
                updateImage={(d) => {
                  setImageS((prev) => {
                    return { ...prev, [`picture-${index}`]: d }
                  })
                }}
                width={768}
                height={432}
              />
            </div>
          )
      })}
    </div>
  )
}

const ReviewContent: FC<{ reviews: any[]; onLoad: () => void; clubID: string, setReviews:any, setImageReview: any, setRerender: any }> = ({
  reviews,
  onLoad,
  clubID,
  setReviews,
  setImageReview,
  setRerender
}) => {


  return (
    <div className="space-y-10 md:space-y-16">
      {reviews.length > 0 && <h1 className="text-2xl text-TUCMC-gray-700">รีวิวจากรุ่นพี่</h1>}
      <div className="space-y-16 md:space-y-24">
        {reviews.map((revContent, index) => {
          return (
            <Review
              revContent={revContent}
              index={index}
              onLoad={onLoad}
              clubID={clubID}
              setReviews={setReviews}
              setImageReview={setImageReview}
            />
          )
        })}
      </div>
    </div>
  )
}

const Review = ({revContent, index, onLoad,clubID, setReviews, setImageReview, setRerender}) => {

  const [image, setImage] = useState<string | null>(null)
  const uploader = useRef(null)
  const doUpload = async (e) => {
    const data = await toBase64(e.target.files[0])
    //@ts-ignore
    setImage(data)
  }

  useEffect(() => {
    setImageReview((prev) => {
      return { ...prev, [`review-${index}`]: image }
    })
  }, [image])

  return (<div key={`review-${index}`}>
  <div className="flex flex-wrap-reverse md:flex-row md:flex-nowrap">
    <div className="mt-6 ml-4 flex flex-row md:mt-0 md:flex-col">
      <div className="relative h-20 w-20 md:h-24 md:w-24">
        {!image ? <Image
          priority={true}
          onLoad={onLoad}
          src={`${revContent.profile}`}
          placeholder="blur"
          quality={50}
          blurDataURL={`${revContent.profile}`}
          width="128"
          height="128"
          className="rounded-lg object-cover"
        /> : <img src={image} width="128px"
        height="128px" className="rounded-lg object-cover w-20 h-20 md:h-24 md:w-24"/>}
        <input
            className="hidden"
            ref={uploader}
            onChange={doUpload}
            type="file"
            accept="image/png, image/jpeg, image/heif"
          />
          <motion.div onClick={() => {uploader.current.click()}} initial={{opacity: 0}} whileHover={{opacity: 1}} className="absolute text-white flex justify-center rounded-lg bg-TUCMC-gray-800 bg-opacity-70 items-center w-full h-full cursor-pointer top-0">
            <CameraIcon className="w-12 h-12"/>
          </motion.div>
      </div>
      <div className="mt-1 flex flex-col pl-2 text-gray-500 md:mt-3 md:pl-0">
        <h1 contentEditable={true} onKeyUpCapture={(e) => {setReviews(prev => {
          prev[index].name = e.target.innerText
          return prev
        })}} className="text-xl font-black md:text-2xl">{revContent.name}</h1>
        <span contentEditable={true} onKeyUpCapture={(e) => {setReviews(prev => {
          prev[index].contact = e.target.innerText
          return prev
        })}} className="w-max text-xs">{revContent.contact}</span>
        <span className="text-xs">เตรียมอุดม <span contentEditable={true} onKeyUpCapture={(e) => {setReviews(prev => {
          prev[index].year = e.target.innerText
          return prev
        })}}>{revContent.year}</span></span>
      <div onClick={() => {
        setReviews(prev => {
          return removeItem(prev, index)
        })
        setRerender(true)
      }} className="bg-red-100 rounded-md flex justify-center shadow-md py-1 mt-2 cursor-pointer">
        <TrashIcon className="w-7 h-7"/>
      </div>
      </div>
    </div>
    <div className="flex flex-col md:ml-8 w-full">
      <div className="relative hidden md:block">
        <span className="absolute left-10 top-6 text-7xl text-gray-300">“</span>
      </div>
      <div className="bg-white rounded-xl px-6 shadow-lg md:px-16 md:pt-12 md:pb-16">
        <div className="h-12 pt-2 text-center text-6xl text-gray-300 md:hidden">
          <span className="absolute">“</span>
        </div>
        <QuillEditor
          value={revContent.context}
          onChange={(e) => {setReviews(prev => {
                    prev[index].context = e
                    return prev
                  })
                }}
              >
                {revContent.year}
              </span>
            </span>
          </div>
        </div>
        <div className="flex w-full flex-col md:ml-8">
          <div className="relative hidden md:block">
            <span className="absolute left-10 top-6 text-7xl text-gray-300">“</span>
          </div>
          <div className="rounded-xl bg-white px-6 shadow-lg md:px-16 md:pt-12 md:pb-16">
            <div className="h-12 pt-2 text-center text-6xl text-gray-300 md:hidden">
              <span className="absolute">“</span>
            </div>
            <QuillEditor
              value={revContent.context}
              onChange={(e) => {
                setReviews((prev) => {
                  prev[index].context = e
                  return prev
                })
              }}
              className="w-full"
            />
            <h1 className="mt-4 h-14 w-full text-center text-6xl text-gray-300 md:hidden">”</h1>
          </div>
          <div className="relative hidden md:block">
            <span className="absolute right-16 -top-16 text-7xl text-gray-300">”</span>
          </div>
        </div>
      </div>
    </div>
  )
}

const Page = ({ data, clubID, images, clubData, clubList, newImages }) => {
  const { onReady } = useAuth()
  const router = useRouter()

  const [loadingCount, setLoadingCount] = useState(1)

  const contactRef = useRef(null)
  const { width } = useWindowDimensions()
  const { addToast } = useToast()

  const [rerender, setRerender] = useState(false)
  
  useEffect(() => {
    rerender && setRerender(false)
  }, [rerender])

  const [reviews, setReviews] = useState(data.reviews)
  const [mainArt, setMainArt] = useState(data.description)

  const [contactData, setContactData] = useState({contact: data.contact, contact2: data.contact2, contact3: data.contact3})

  const [imageHead, setImageHead] = useState<string | null>(null)
  const [imageS, setImageS] = useState({})
  const [imageReview, setImageReview] = useState({})

  const getAllPart = async () => {
    const res = await request("database/editWeb", "submitChanges", {
      panelID: clubID,
      reviews: reviews,
      main: mainArt,
      images: { mainImage: imageHead, ...imageS, ...imageReview },
    })

    if (res.status) {
      addToast({
        theme: "modern",
        icon: "tick",
        title: "ส่งการแก้ไขข้อมูลสำเร็จ",
        text: "",
      })
    } else {
      addToast({
        theme: "modern",
        icon: "cross",
        title: "พบข้อผิดพลาดระหว่างพยายามแก้ไขข้อมูล",
        text: "",
      })
    }

    return true
  }

  const userData = onReady((logged, userData) => {
    if (!logged) Router.push("/auth")
    else if (!("panelID" in userData) || userData.panelID.length <= 0) {
      Router.push("/select")
    } else if (!userData.panelID.includes(clubID)) {
      Router.push("/")
    }

    return userData
  })

  useEffect(() => {
    // get count of every Image element
    setLoadingCount(images.length + 1)

    setTimeout(() => {
      setLoadingCount(0)
    }, 10000)
  }, [router.query])

  const loaded = () => {
    setTimeout(() => {
      setLoadingCount((prevState) => prevState - 1)
    }, 100)
  }

  return (
    <PageContainer>
      {rerender && <div className="hidden">s</div>}
      <div className={classnames(loadingCount > 0 && "absolute opacity-0")}>
        <div className="mx-auto max-w-[1100px]">
          <ClubHeaderCard clubID={clubID} contactRef={contactRef} data={data} onLoad={loaded} publish={getAllPart} image={imageHead} setImage={setImageHead} newImages={newImages} contact={contactData} setContact={setContactData} />
          <div className="w-full border-b border-TUCMC-gray-300 md:hidden"></div>
          <div className="space-y-12 px-6 pb-24 pt-11 md:space-y-16 md:pt-12">
            <MainArticle value={mainArt} setValue={setMainArt} />
            <SummaryImages clubID={clubID} images={images} onLoad={loaded} setImageS={setImageS} />
            <ReviewContent clubID={clubID} onLoad={loaded} reviews={reviews} setReviews={setReviews} setImageReview={setImageReview} setRerender={setRerender}/>
          </div>
        </div>
      </div>
      <ClubSkeleton className={classnames(loadingCount <= 0 && "hidden")} />
    </PageContainer>
  )
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const data = await initialisedDB.collection("clubDisplay").doc(params.clubID.toString()).get()

  const images = fs.readdirSync(`./public/assets/images/clubs/${params.clubID}/`)
  const clubDisplayData = data.data()

  const clubDataDoc = await initialisedDB.collection("clubs").doc("mainData").get()

  const clubData = clubDataDoc?.get(params.clubID.toString())
  const clubIndex = fs.readFileSync("./_map/clubs.json")
  const clubList = JSON.parse(clubIndex.toString())

  return {
    props: {
      data: {
        ...clubDisplayData,
        description: data.get("description"),
        reviews: data.get("reviews"),
      },
      clubData: clubData,
      clubID: params.clubID,
      images: images,
      newImages: data.get("images") || {},
      clubList: clubList,
    },
  }
}

export default Page
