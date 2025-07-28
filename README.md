# [Finite State Automata Simulator](https://finite-state-automata-simulator.vercel.app/)

A web application that lets you design, visualize, and test Deterministic Finite Automata (DFA) with an interactive visual interface and comprehensive testing capabilities.

## What it Does

This simulator provides a complete DFA development environment that allows users to:
- **Design DFAs**: Create states, define transitions, and set accepting states with an intuitive drag-and-drop interface
- **Visual Testing**: Test strings and watch the execution path animate in real-time with color-coded feedback
- **Comprehensive Analysis**: View detailed state transition sequences to understand exactly how strings are processed
- **Interactive Controls**: Manage input alphabets, rename states, and modify transitions with user-friendly dialogs
- **Error Handling**: Robust validation ensures only valid DFAs can be created and tested
- **Empty String Support**: Full support for testing empty strings (ε) with proper visual feedback

## Demo

https://github.com/akhan531/Finite-State-Automata-Simulator/blob/main/demos/modelDFA.mov

This DFA accepts only binary numbers that are multiples of 3. We will recreate this DFA using our simulator.

https://github.com/akhan531/Finite-State-Automata-Simulator/blob/main/demos/buildingDFA.mov

Creating the DFA.

https://github.com/akhan531/Finite-State-Automata-Simulator/blob/main/demos/testingDFA.mov

Tested the DFA with 101001010011011001101<sub>2</sub>, or 1353421<sub>10</sub>, which is not divisible by 3.     

## Key Features

### 🎨 **Modern User Interface**
- Custom modal dialogs replace browser prompts for a polished experience
- Fixed-position alerts that don't disrupt the visualization layout
- Responsive design that works seamlessly on desktop and mobile devices
- Professional gradient backgrounds and smooth animations

### 🔍 **Advanced Testing Capabilities**
- **Real-time Animation**: Watch states light up as strings are processed
- **Detailed Sequence View**: Full-screen modal showing step-by-step state transitions
- **Smart String Handling**: Automatic truncation of long strings with expand/collapse functionality
- **Empty String Testing**: Proper handling and visualization of ε (epsilon) transitions
- **Result Analysis**: Clear acceptance/rejection feedback with explanatory messages

### 🛠 **Comprehensive State Management**
- **Dynamic State Creation**: Add, remove, and rename states with validation
- **Flexible Transitions**: Support for multiple input symbols per transition
- **Visual State Indicators**: Accepting states marked with distinctive borders
- **Start State Arrows**: Clear visual indication of the starting state

### 🔤 **Input Alphabet Management**
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

### 🏗️ **Building Your DFA**

1. **Create States**: Click "Add State" and provide meaningful names
2. **Set Start State**: Click "Set Start State" then select your initial state
3. **Mark Accepting States**: Use "Toggle Accepting" to designate final states
4. **Add Input Symbols**: Click "+" to build your input alphabet (single characters only)

### 🔗 **Creating Transitions**

1. Click "Add Transition"
2. Select the source state by clicking on it
3. Select the destination state
4. Enter the input symbol (automatically added to alphabet if new)
5. Multiple symbols can share the same transition path

### 🧪 **Testing Your DFA**

1. Click "Run Test" 
2. Enter a test string (leave empty to test ε)
3. Watch the real-time animation as your DFA processes the input
4. View the result: **Green** = Accepted, **Red** = Rejected
5. Click "View Sequence" for detailed step-by-step analysis

### 📊 **Understanding Results**

The sequence viewer shows:
- **Input Breakdown**: Each character numbered and highlighted
- **State Path**: Visual representation of the transition sequence
- **Final Analysis**: Detailed explanation of why the string was accepted or rejected

## Advanced Features I Built

### 🎯 **Error Prevention & Handling**
- **DFA Validation**: Ensures deterministic behavior (one transition per input per state)
- **State Existence Checks**: Prevents operations on deleted states
- **Graceful Error Recovery**: Robust error handling that doesn't crash the application
- **User Feedback**: Clear warning messages for invalid operations

### 🎨 **User Experience Enhancements**
- **Non-Disruptive Alerts**: Fixed positioning prevents layout shifts
- **Smart String Display**: Long strings are truncated with hover tooltips and expand options
- **Keyboard Navigation**: Enter/Escape key support in all dialogs
- **Visual State Feedback**: Immediate visual confirmation of all operations

### 🔧 **Technical Improvements**
- **Memory Management**: Proper cleanup of event listeners and timeouts
- **Race Condition Prevention**: Safe handling of asynchronous operations
- **Position Management**: Robust node positioning with multiple fallback strategies
- **Data Persistence**: Test results and sequences stored for detailed analysis

## What I Learned

- **Complex State Management**: Coordinating between React components and vanilla JavaScript visualization libraries
- **Advanced User Interactions**: Creating intuitive modal systems and drag-and-drop interfaces
- **Error Handling Strategies**: Building robust applications that gracefully handle edge cases
- **Performance Optimization**: Managing animations and large datasets efficiently
- **Accessibility**: Ensuring the application works well for all users
- **Modern React Patterns**: Leveraging hooks, context, and modern React features effectively

## Architecture Highlights

- **Hybrid Architecture**: Seamless integration between React components and vis.js
- **Global State Management**: Efficient communication between UI and visualization layers
- **Modular Design**: Clean separation of concerns between DFA logic and presentation
- **Type Safety**: Comprehensive TypeScript coverage for better maintainability

## Future Improvements

- **Persistence**: Save/load DFAs to local storage or cloud
- **Export Capabilities**: Generate images or formal descriptions of DFAs
- **NFA Support**: Extend to Non-deterministic Finite Automata
- **Batch Testing**: Test multiple strings simultaneously
- **Educational Mode**: Step-by-step tutorials and guided examples
- **Formal Verification**: Mathematical validation of DFA properties

## Live Demo

Visit the live application: [https://finite-state-automata-simulator.vercel.app/](https://finite-state-automata-simulator.vercel.app/)

## Contact

I'd love to hear your feedback or answer any questions about this project!

- **Email**: [alibkhan531@gmail.com](mailto:alibkhan531@gmail.com)
- **LinkedIn**: [alikhan531](https://www.linkedin.com/in/alikhan531/)
- **GitHub**: [@akhan531](https://github.com/akhan531)
