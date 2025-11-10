import dynamic from 'next/dynamic'
import { useState } from 'react'
import 'react-quill/dist/quill.snow.css'

const QuillNoSSRWrapper = dynamic(
  import('react-quill').then((ReactQuill) => {
    return ReactQuill
  }),
  {
    ssr: false,
    loading: () => <p>Loading ...</p>,
  },
)

const modules = {
  toolbar: [
    [{ header: ['1', '2', '3', '4', '5', '6', false] },],
    [{ size: [] }],
    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
    [
      { indent: '-1' },
      { indent: '+1' },
    ],
    ['link', 'image',],
    ['video'],
    ['clean'],
    [{ 'align': [] }],
  ],
  clipboard: {
    matchVisual: false,
  },
}

const formats = [
  'header',
  'size',
  'bold',
  'italic',
  'color',
  'underline',
  'strike',
  'blockquote',
  'list',
  'bullet',
  'indent',
  'link',
  'image',
  'video',
  'align'

]

export default function QuillEditor({ sm, onChange, placeholder, value, readonly = false }) {
  const [content, setContent] = useState('')
  return (
    <QuillNoSSRWrapper
      placeholder={placeholder || 'Write something...'}
      modules={modules}
      formats={formats}
      theme="snow"
      readOnly={readonly}
      onChange={onChange}
      className={`${sm ? 'quill-sm' : ''}`}
      value={value}
    />
  )
}
