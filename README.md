# [Finite State Automata Simulator](https://finite-state-automata-simulator.vercel.app/)

A web application that lets you design, visualize, and test Deterministic Finite Automata (DFA) with an interactive visual interface and comprehensive testing capabilities.

## What it Does

This simulator provides a complete DFA development environment that allows users to:
- **Design DFAs**: Create states, define transitions, and set accepting states with an intuitive drag-and-drop interface
- **Visual Testing**: Test strings and watch the execution path animate in real-time with color-coded feedback
- **Comprehensive Analysis**: View detailed state transition sequences to understand exactly how strings are processed
- **Interactive Controls**: Manage input alphabets, rename states, and modify transitions with user-friendly dialogs

## Demo

![Model DFA](https://github.com/akhan531/Finite-State-Automata-Simulator/blob/main/demos/modelDFA.png?raw=true)  
*This DFA accepts only binary numbers that are multiples of 3. We will recreate this DFA using our simulator.*

![Building the DFA](https://github.com/akhan531/Finite-State-Automata-Simulator/blob/main/demos/buildingDFA.gif?raw=true)  
*Creating the DFA.*

![Testing the DFA](https://github.com/akhan531/Finite-State-Automata-Simulator/blob/main/demos/testingDFA.gif?raw=true)  
*Tested the DFA with `101001010011011001101` (1353421<sub>10</sub>), which is not divisible by 3.*   

## Key Features

### **Advanced Testing Capabilities**
- **Real-time Animation**: Watch states light up as strings are processed
- **Detailed Sequence View**: Full-screen modal showing step-by-step state transitions
- **Smart String Handling**: Automatic truncation of long strings with expand/collapse functionality
- **Empty String Testing**: Proper handling and visualization of ε (epsilon) transitions
- **Result Analysis**: Clear acceptance/rejection feedback with explanatory messages

### **Comprehensive State Management**
- **Dynamic State Creation**: Add, remove, and rename states with validation
- **Flexible Transitions**: Support for multiple input symbols per transition
- **Visual State Indicators**: Accepting states marked with distinctive borders
- **Start State Arrows**: Clear visual indication of the starting state

### **Input Alphabet Management**
- **Interactive Alphabet**: Click to rename or delete input symbols
- **Visual Symbol Display**: Input symbols shown as interactive badges
- **Automatic Integration**: New symbols automatically added when creating transitions

## Technologies Used

- **Next.js 15** - Latest React framework with App Router
- **TypeScript** - For type-safe development and better code reliability
- **Tailwind CSS** - For modern styling and responsive design
- **vis.js** - For interactive graph visualization and network diagrams
- **shadcn/ui** - For consistent, accessible UI components
- **Lucide React** - For beautiful, consistent icons throughout the interface

## How to Use the Simulator

### **Building Your DFA**

1. **Create States**: Click "Add State" and provide meaningful names
2. **Set Start State**: Click "Set Start State" then select your initial state
3. **Mark Accepting States**: Use "Toggle Accepting" to designate final states
4. **Add Input Symbols**: Click "+" to build your input alphabet (single characters only)

### **Creating Transitions**

1. Click "Add Transition"
2. Select the source state by clicking on it
3. Select the destination state
4. Enter the input symbol (automatically added to alphabet if new)
5. Multiple symbols can share the same transition path

### **Testing Your DFA**

1. Click "Run Test" 
2. Enter a test string (leave empty to test ε)
3. Watch the real-time animation as your DFA processes the input
4. View the result: **Green** = Accepted, **Red** = Rejected
5. Click "View Sequence" for detailed step-by-step analysis

### **Understanding Results**

The sequence viewer shows:
- **Input Breakdown**: Each character numbered and highlighted
- **State Path**: Visual representation of the transition sequence
- **Final Analysis**: Detailed explanation of why the string was accepted or rejected

## Advanced Features I Built

### **Error Prevention & Handling**
- **DFA Validation**: Ensures deterministic behavior (one transition per input per state)
- **State Existence Checks**: Prevents operations on deleted states
- **Graceful Error Recovery**: Robust error handling that doesn't crash the application
- **User Feedback**: Clear warning messages for invalid operations


## Live Demo

Visit the live application: [https://finite-state-automata-simulator.vercel.app/](https://finite-state-automata-simulator.vercel.app/)

## Contact

I'd love to hear your feedback or answer any questions about this project!

- **Email**: [alibkhan531@gmail.com](mailto:alibkhan531@gmail.com)
- **LinkedIn**: [alikhan531](https://www.linkedin.com/in/alikhan531/)
- **GitHub**: [@akhan531](https://github.com/akhan531)
