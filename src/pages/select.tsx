import PageContainer from "@components/common/PageContainer";
import SelectSplash from "@vectors/decorations/SelectSplash";
import {
  ChevronDownIcon, ClipboardCopyIcon,
  SearchIcon,
  SelectorIcon,
  SortAscendingIcon,
  UsersIcon, XIcon
} from '@heroicons/react/solid'
import ClubList from "@components/select/ClubList";
import ClubModal from "@components/select/ClubModal";
import {useEffect, useRef, useState} from "react";
import classnames from "classnames"
import {motion} from "framer-motion"
import {FilterSearch} from "@components/common/Inputs/Search";
import Modal from "@components/common/Modals";
import ConfirmModal from "@components/select/ConfirmModal";
import DataModal from "@components/select/DataModal";
import Toast from "@components/common/Toast";

const Select = () => {

  const [modalState, setModalState] = useState({open: false, data: {}})
  const [clubState, setClubState] = useState({comm: false, hide: true})
  const [select, setSelect] = useState(false)
  const [dataModal, setDataModal] = useState(false)
  const [toast, setToast] = useState({})
  const auTrigger = useRef(null)
  const auClose = useRef(null)

  const clearState = () => {
    setModalState({open: false, data: {}})
  }

  const variants = {
    show: {opacity: 1},
    hide: {opacity: 0}
  }

  const selectClub = () => {
    setSelect(true)
  }

  return (
    <PageContainer>
      <Toast newToast={toast}/>
      <ConfirmModal onAgree={() => {setDataModal(true)}} clubData={modalState} TriggerDep={{dep: select, revert: () => {setSelect(false)}}}/>
      <ClubModal state={modalState} closeAction={clearState} action={selectClub}/>
      <DataModal setToast={setToast} closeFunc={clearState} TriggerDep={{dep: dataModal, revert: () => {setDataModal(false)}}}/>
      <div className="flex flex-col md:flex-row md:justify-center md:items-start md:space-x-6 items-center py-14 px-4">
        <div className="md:max-w-xs">
          <div className="flex flex-col items-center">
            <h1 className="font-medium text-4xl">เลือกชมรม</h1>
            <span className="text-sm tracking-tight">ภายในวันที่ 24 พ.ค. 64</span>
          </div>
          <div className="mt-6 w-full px-8">
            <SelectSplash />
          </div>
          <div className="space-y-6 mt-10 px-2">
            <div className="flex flex-col rounded-lg shadow-md bg-white p-4 py-6 space-y-4">
              <h1 className="text-lg font-medium tracking-tight">คุณได้ลงชื่อ Audition ชมรมไว้</h1>
              <p className="text-gray-600 tracking-tight">ให้ไปทำการ Audition ตามเวลาและสถานที่ที่ชมรมนั้น ๆ กำหนด โดยติดตามรายละเอียดการ Audition จากช่องทางประชาสัมพันธ์ของชมรมนั้นโดยตรง
                และรอการประกาศผลในวันที่ 25 พ.ค. 2564 เวลา 8.00 น.</p>
              <div className="md:hidden relative">
                <a ref={auTrigger} className="text-TUCMC-pink-500 tracking-tight cursor-pointer">ดูรายชื่อชมรมที่ลงชื่อ Audition ไว้ →</a>
                <Modal TriggerRef={auTrigger} CloseID="audiClose" className="shadow-md rounded-lg absolute w-full mt-1 z-20">
                  <div className="flex items-start rounded-t-lg text-sm justify-between bg-gray-50 text-gray-500 py-2 px-4">
                    <h1 className="mt-1">รายชื่อชมรมที่ลงชื่อ Audition ไว้</h1>
                    <XIcon id="audiClose" className="w-7 h-7 cursor-pointer text-TUCMC-gray-400"/>
                  </div>
                  <div className="bg-white rounded-b-lg">
                    <h1 className="py-4 px-4 border-t">ชมรมภาษาอังกฤษ (English Drama)</h1>
                    <h1 className="py-4 px-4 border-t">ชมรมนิเทศศิลป</h1>
                    <h1 className="py-4 px-4 border-t">ชมรมวาทศิลป</h1>
                    <h1 className="py-4 px-4 border-t">ชมรมถ่ายภาพ</h1>
                    <h1 className="py-4 px-4 border-t">ชมรมโลกทั้งระบบ</h1>
                    <h1 className="py-4 px-4 border-t">ชมรมคณิตศาสตร์</h1>
                  </div>
                </Modal>
              </div>
            </div>
            <div className="hidden md:block shadow-md rounded-lg mt-1 z-20">
              <div className="flex items-start rounded-t-lg text-sm justify-between bg-gray-50 text-gray-500 py-2 px-4">
                <h1 className="mt-1">รายชื่อชมรมที่ลงชื่อ Audition ไว้</h1>
              </div>
              <div className="bg-white rounded-b-lg">
                <h1 className="py-4 px-4 border-t">ชมรมภาษาอังกฤษ (English Drama)</h1>
                <h1 className="py-4 px-4 border-t">ชมรมนิเทศศิลป</h1>
                <h1 className="py-4 px-4 border-t">ชมรมวาทศิลป</h1>
                <h1 className="py-4 px-4 border-t">ชมรมถ่ายภาพ</h1>
                <h1 className="py-4 px-4 border-t">ชมรมโลกทั้งระบบ</h1>
                <h1 className="py-4 px-4 border-t">ชมรมคณิตศาสตร์</h1>
              </div>
            </div>
            <div className="flex flex-col items-start rounded-lg shadow-md bg-white p-4 py-6 space-y-4">
              <h1 className="text-lg font-medium tracking-tight">โควตายืนยันสิทธิ์ชมรมเดิม</h1>
              <p className="text-gray-600 tracking-tight">นักเรียนสามารถใช้โควตายืนยันสิทธิ์ชมรมเดิมได้ทันที (ชมรม...) *โควตามีจำนวนจำกัด</p>
              <a className="bg-TUCMC-green-400 text-white whitespace-nowrap rounded-3xl shadow-md px-5 py-2.5">ยืนยันสิทธิ์ชมรมเดิม</a>
            </div>
          </div>
        </div>
        <div className="mt-16 md:mt-0">
          <div className="border-b pb-5 mx-4">
            <div>
              <FilterSearch/>
            </div>
          </div>
          <div className="flex flex-col md:flex-row md:space-x-4 mt-6">
            <div className="space-y-2">
              <ClubList title="ชมรมสีสรรพ์ภาษาต่างประเทศที่ 2 (French Chorus)" state="full" action={setModalState}/>
              <ClubList title="ชมรมพัฒนาศักยภาพทางวิทยาศาสตร์" state="open" action={setModalState}/>
              <ClubList title="ชมรมสังคมศึกษา (หลากทัศนะประวัติศาสตร์)" audition={true} action={setModalState}/>
              <ClubList title="ชมรมสีสรรพ์ภาษาต่างประเทศที่ 2 (French Chorus)" state="full" action={setModalState}/>
              <ClubList title="ชมรมพัฒนาศักยภาพทางวิทยาศาสตร์" state="open" action={setModalState}/>
              <ClubList title="ชมรมสังคมศึกษา (หลากทัศนะประวัติศาสตร์)" audition={true} action={setModalState}/>
              <ClubList title="ชมรมสีสรรพ์ภาษาต่างประเทศที่ 2 (French Chorus)" state="full" action={setModalState}/>
              <ClubList title="ชมรมพัฒนาศักยภาพทางวิทยาศาสตร์" state="open" action={setModalState}/>
              <ClubList title="ชมรมสังคมศึกษา (หลากทัศนะประวัติศาสตร์)" audition={true} action={setModalState}/>
              <ClubList title="ชมรมสีสรรพ์ภาษาต่างประเทศที่ 2 (French Chorus)" state="full" action={setModalState}/>
              <ClubList title="ชมรมพัฒนาศักยภาพทางวิทยาศาสตร์" state="open" action={setModalState}/>
              <ClubList title="ชมรมสังคมศึกษา (หลากทัศนะประวัติศาสตร์)" audition={true} action={setModalState}/>
            </div>
            <div className="mt-2 md:mt-0 space-y-2">
              <ClubList title="ชมรมสีสรรพ์ภาษาต่างประเทศที่ 2 (French Chorus)" state="full" action={setModalState}/>
              <ClubList title="ชมรมพัฒนาศักยภาพทางวิทยาศาสตร์" state="open" action={setModalState}/>
              <ClubList title="ชมรมสังคมศึกษา (หลากทัศนะประวัติศาสตร์)" audition={true} action={setModalState}/>
              <ClubList title="ชมรมสีสรรพ์ภาษาต่างประเทศที่ 2 (French Chorus)" state="full" action={setModalState}/>
              <ClubList title="ชมรมพัฒนาศักยภาพทางวิทยาศาสตร์" state="open" action={setModalState}/>
              <ClubList title="ชมรมสังคมศึกษา (หลากทัศนะประวัติศาสตร์)" audition={true} action={setModalState}/>
              <ClubList title="ชมรมสีสรรพ์ภาษาต่างประเทศที่ 2 (French Chorus)" state="full" action={setModalState}/>
              <ClubList title="ชมรมพัฒนาศักยภาพทางวิทยาศาสตร์" state="open" action={setModalState}/>
              <ClubList title="ชมรมสังคมศึกษา (หลากทัศนะประวัติศาสตร์)" audition={true} action={setModalState}/>
              <ClubList title="ชมรมสีสรรพ์ภาษาต่างประเทศที่ 2 (French Chorus)" state="full" action={setModalState}/>
              <ClubList title="ชมรมพัฒนาศักยภาพทางวิทยาศาสตร์" state="open" action={setModalState}/>
              <ClubList title="ชมรมสังคมศึกษา (หลากทัศนะประวัติศาสตร์)" audition={true} action={setModalState}/>
            </div>
          </div>
        </div>
      </div>
    </PageContainer>
  )
}

export default Select