import './App.css'
import TasksList from './components/TasksList'

function App() {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold mb-4">TaskIt</h1>
      <TasksList />
    </div>
  )
}

export default App
