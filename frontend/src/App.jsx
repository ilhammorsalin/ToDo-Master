// Import the useState hook from React - this lets us add state (data that can change) to our component
import { useState } from 'react'

function App() {
  // Create a state variable 'count' starting at 0, and 'setCount' to update it
  const [count, setCount] = useState(0)
  
  // Create a state variable 'taskText' to store what the user types in the input box
  const [text, setText] = useState('')
  
  // Create a state variable 'tasks' to store the list of tasks (starts as empty array [])
  const [tasks, setTasks] = useState([])

  // Define the visual style for the counter box
  const boxStyle = {
    width: 120,           // Box is 120 pixels wide
    height: 120,          // Box is 120 pixels tall
    border: '2px solid #333',  // Dark gray border, 2px thick
    borderRadius: 8,      // Rounded corners (8px radius)
    display: 'inline-flex',    // Use flexbox layout (inline so it doesn't take full width)
    alignItems: 'center',      // Center content vertically
    justifyContent: 'center',  // Center content horizontally
    cursor: 'pointer',         // Show hand cursor when hovering (indicates clickable)
    userSelect: 'none',        // Prevent text selection when clicking
    fontSize: 24,              // Number text size
    fontWeight: 600,           // Make number text semi-bold
    background: '#f8f8f8',     // Light gray background color
  }

  // Function that runs when user wants to add a task
  const addTask = () => {
    // Remove whitespace from start and end of the text
    const trimmedText = text.trim()
    
    // If text is empty after trimming, exit early (don't add empty tasks)
    if (!trimmedText) return
    
    // Update the tasks list: take the old list (prev) and add a new task object at the end
    // The new task has an id (timestamp) and the text
    setTasks((prev) => [...prev, { id: Date.now(), text: trimmedText }])
    
    // Clear the input box by setting text back to empty string
    setText('')
  }

  // Function that runs when the form is submitted (Enter key or + button clicked)
  const onSubmit = (e) => {
    // Prevent the form from refreshing the page (default browser behavior)
    e.preventDefault()
    
    // Call the addTask function to actually add the task
    addTask()
  }

  // Return the JSX (HTML-like syntax) that defines what appears on screen
  return (
    <div style={{ padding: 16 }}>  {/* Main container with 16px padding */}
      
      {/* Counter button that shows a number and increments when clicked */}
      <button
        type="button"  // Specify it's a regular button (not a submit button)
        onClick={() => setCount((c) => c + 1)}  // When clicked, increase count by 1
        style={boxStyle}  // Apply the boxStyle object we defined above
        aria-label={`Counter, current value ${count}. Click to increment.`}  // For screen readers
      >
        {count}  {/* Display the current count number inside the button */}
      </button>

      {/* Form for adding new tasks */}
      <form onSubmit={onSubmit} style={{ marginTop: 16, display: 'flex', gap: 8, alignItems: 'center' }}>
        
        {/* Label for the input (connected by htmlFor="taskInput") */}
        <label htmlFor="taskInput2" style={{ fontWeight: 600 }}>
          Add task:
        </label>
        
        {/* Text input where user types their task */}
        <input
          id="taskInput2"  // ID matches the label's htmlFor
          type="text"     // It's a text input
          value={text}  // The input shows whatever is in taskText state
          onChange={(e) => setText(e.target.value)}  // When user types, update taskText
          placeholder="Type a task"  // Gray hint text shown when input is empty
          style={{ padding: '8px 10px', border: '1px solid #ccc', borderRadius: 6, flex: '1 1 auto' }}
        />
        
        {/* Submit button with + symbol */}
        <button
          type="submit"  // Submitting this button triggers the form's onSubmit
          aria-label="Add task"  // For screen readers
          disabled={!text.trim()}  // Disable button if input is empty or only whitespace
          style={{
            padding: '8px 12px',
            border: '1px solid #333',
            borderRadius: 6,
            background: '#eaeaea',
            cursor: text.trim() ? 'pointer' : 'not-allowed',  // Change cursor based on disabled state
            fontWeight: 700,
          }}
        >
          +  {/* The plus symbol shown in the button */}
        </button>
      </form>

      {/* Unordered list (bullet points) to display all tasks */}
      <ul style={{ marginTop: 12, paddingLeft: 20 }}>
        {/* Loop through each task in the tasks array and create a list item for each */}
        {tasks.map((t) => (
          <li key={t.id}>  {/* key helps React track which items changed */}
            {t.text}  {/* Display the task text */}
          </li>
        ))}
      </ul>
    </div>
  )
}

// Export App so other files can import and use it (main.jsx imports this)
export default App
