import dynamic from "next/dynamic"
import { forwardRef } from "react"
import { ComponentPropsWithRef, ComponentType, FC, ReactElement, useCallback, useEffect, useRef, useState } from "react"
const ReactQuill = dynamic(() => import("./QuillCore"), {
  ssr: false,
})

const ForwardedReactQuill = forwardRef((props: any, ref) => <ReactQuill {...props} editorRef={ref} />)

export const QuillEditor: FC = () => {
  const [value, setValue] = useState("")
  const quillRef = useRef(null)

  return (
    <div className="mows m-6 rounded-md border border-gray-300 px-2 py-4">
      <ForwardedReactQuill
        placeholder="Type something..."
        value={value}
        bounds={".mows"}
        ref={quillRef}
        onChange={(v) => setValue(v)}
        onClick={(e) => {
          e.preventDefault()

          const quill = quillRef.current.getEditor()
          console.log("click")

          if (e.type === "contextmenu") {
            // right click
            console.log("right click")
            quill.theme.tooltip.edit()
            quill.theme.tooltip.show()
          }
        }}
        modules={{
          toolbar: [
            [
              { header: ["1", "2", false] },
              // { font: [] }
            ],
            // [{ size: [] }],
            ["bold", "italic", "underline", "strike", "blockquote"],
            [{ list: "ordered" }, { list: "bullet" }, { indent: "-1" }, { indent: "+1" }],
            [
              "link",
              "image",
              // "video"
            ],
            // ["clean"],
          ],
          clipboard: {
            // toggle to add extra line breaks when pasting HTML:
            matchVisual: false,
          },
        }}
        theme="bubble"
        // theme="snow"
        formats={[
          "header",
          // "font",
          // "size",
          "bold",
          "italic",
          "underline",
          "strike",
          "blockquote",
          "list",
          "bullet",
          "indent",
          "link",
          "image",
          "video",
        ]}
      />
    </div>
  )
}
