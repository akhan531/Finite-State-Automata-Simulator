# Finite State Automata Simulator(https://finite-state-automata-simulator.vercel.app/)

A web application that lets you design and test Finite State Automata with an interactive visual interface.

## What it Does

This simulator allows users to:
- Create states by clicking and dragging
- Define transitions between states with input symbols
- Set start states and accepting states
- Test strings to see if the automata accepts or rejects them
- Watch the execution path light up in real-time

## Screenshots

[Add 2-3 screenshots of your app here - one showing the interface, one showing a DFA being built, one showing string testing]

## Technologies Used

- **Next.js** - React framework for the web application
- **TypeScript** - For type-safe JavaScript
- **Tailwind CSS** - For styling and responsive design
- **vis.js** - For interactive graph visualization
- **shadcn/ui** - For modern UI components

## How to Use the Simulator

### Building Your Finite State Automata:

1. Click "Add State" to create new states
2. Click "Set Start State" then click on a state to make it the starting point
3. Click "Toggle Accepting" then click states to mark them as accepting
4. Click the "+" button to add input symbols to your alphabet


### Creating Transitions:

1. Click "Add Transition"
2. Click on the source state
3. Click on the destination state
4. Enter the input symbol for this transition


### Testing Strings:

1. Click "Run Test"
2. Enter a string to test
3. Watch as the simulator shows the path through your automata
4. See if the string is accepted (green) or rejected (red)


## Features I Built

- **Custom Modal Dialogs**: Replaced browser prompts with polished in-app modals
- **Real-time Visualization**: States light up as strings are processed
- **Drag and Drop**: Move states around to organize your diagram
- **Responsive Design**: Works on both desktop and mobile devices
- **Input Validation**: Ensures only valid automata can be created


## What I Learned

- How to integrate third-party visualization libraries (vis.js) with React
- Managing complex state between UI components and data logic
- Creating custom modal systems and user interactions
- Building responsive interfaces with Tailwind CSS
- Working with TypeScript for better code reliability


## Future Improvements

- Save/load automata to local storage
- Export diagrams as images
- Support for Non-deterministic Finite Automata (NFA)
- Step-by-step execution mode
- Multiple string testing at once


## Contact

Feel free to reach out if you have questions about this project!

- Email: [alibkhan531@gmail.com](mailto:alibkhan531@gmail.com)
- LinkedIn: [alikhan531](https://www.linkedin.com/in/alikhan531/)
- GitHub: [@akhan531](https://github.com/akhan531)
