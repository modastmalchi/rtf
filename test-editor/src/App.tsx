import { Form } from 'antd'
import TextEditor from './TextEditor'
import 'antd/dist/reset.css'

function App() {
  const [form] = Form.useForm()

  return (
    <div style={{ padding: '50px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1 style={{ textAlign: 'center', marginBottom: '30px' }}>تست ادیتور متن</h1>
      <Form form={form}>
        <TextEditor 
          name="content"
          label="محتوا"
          form={form}
        />
      </Form>
    </div>
  )
}

export default App
