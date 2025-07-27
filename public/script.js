//#region DFA
class state {
  constructor(id, accepts, outs) {
    this.id = id
    this.accepts = accepts
    this.outs = outs
  }
}

let states = [new state(0, false, {})]
const inputs = new Set()
let currentStateCount = 1
let globalId = 1
let startId = null

//DFA functions
function findState(stateId) {
  for (let i = 0; i < currentStateCount; i++) {
    if (states[i].id == stateId) {
      return states[i]
    }
  }
}

function addLink(state1Id, state2Id, inputVal) {
  const state1 = findState(state1Id)
  const state2 = findState(state2Id)
  state1.outs[inputVal] = state2
}

function removeLink(stateId, inputs) {
  const state = findState(stateId)
  if (inputs) {
    const arr = inputs.split(",")
    for (const inputVal of arr) {
      if (inputVal in state.outs) {
        delete state.outs[inputVal]
      }
    }
  }
}

function addState() {
  const newState = new state(globalId, false, {})
  states.push(newState)
  currentStateCount++
  globalId++
  return newState
}

function removeState(stateId) {
  const state = findState(stateId)
  for (const s in { ...state.outs }) {
    removeLink(stateId, s)
  }
  states = states.filter((item) => item.id !== stateId)
  if (startId === stateId) {
    startId = null
  }
  currentStateCount--
}

function addInput(inputVal) {
  if (inputVal.length !== 1) {
    if (window.showInPageAlert) {
      window.showInPageAlert("Input value must be a single character.", "warning")
    }
    return
  }
  inputs.add(inputVal)
}

function deleteInput(inputVal) {
  inputs.delete(inputVal)
  for (let i = 0; i < currentStateCount; i++) {
    const state = states[i]
    if (inputVal in state.outs) {
      removeLink(state.id, inputVal)
    }
  }
}

function renameInput(oldName, newName) {
  if (newName.length !== 1) {
    if (window.showInPageAlert) {
      window.showInPageAlert("Input value must be a single character.", "warning")
    }
    return
  }
  inputs.delete(oldName)
  inputs.add(newName)
  for (let i = 0; i < currentStateCount; i++) {
    const state = states[i]
    if (oldName in state.outs) {
      const end = state.outs[oldName]
      removeLink(state.id, oldName)
      addLink(state.id, end.id, newName)
    }
  }
}

function test(testString) {
  let curr = findState(startId)
  const path = [curr]
  for (let i = 0; i < testString.length; i++) {
    if (testString[i] in curr.outs) {
      curr = curr.outs[testString[i]]
      path.push(curr)
    } else {
      return path
    }
  }
  return path
}

//#endregion

//#region Network visualization
const vis = window.vis // Declare the vis variable
const container = document.getElementById("network")
const nodes = new vis.DataSet([
  { id: 0, label: "0", color: "#f0f0f0", x: container.offsetWidth / 2, y: container.offsetHeight / 2 },
])
const edges = new vis.DataSet([])
const data = { nodes, edges }
const options = {
  edges: {
    arrows: "to",
    font: { size: 14 },
    smooth: {
      type: "dynamic", // Automatically adjust curvature based on the number of edges
      roundness: 0.5, // Adjust the curvature
    },
    color: {
      color: "#000000", // Default color
      highlight: "#848484",
      hover: "#848484",
      inherit: "none", // <-- Disables all color inheritance
    },
  },

  nodes: {
    shape: "circle",
    font: { size: 16 },
    borderWidth: 2,
    color: {
      border: "#000000",
    },
  },

  interaction: {
    dragNodes: true,
    dragView: true,
    zoomView: true,
  },
  physics: {
    enabled: false,
    /*
        "barnesHut": {
            "springConstant": 0,
            "avoidOverlap": 0.0001
        }
        */
  },
}

const network = new vis.Network(container, data, options)

// Make nodes and network available globally for the React component
window.nodes = nodes
window.network = network

//#endregion

//#region Functions

// State management
let isAddingLink = false
let linkSourceNode = null
let isRemovingState = false
let isRenamingState = false
let isSettingStartState = false
let isSwitchingAccepting = false
let isRemovingLink = false
let linkDestNode = null // Declare the linkDestNode variable

// Input alphabet management
const inputList = document.getElementById("input-list")
const addInputButton = document.getElementById("add-input")

function clearSelections() {
  isAddingLink = false
  linkSourceNode = null
  isRemovingState = false
  isRenamingState = false
  isSettingStartState = false
  isSwitchingAccepting = false
  isRemovingLink = false
  linkDestNode = null // Reset linkDestNode on clear
}

function sleep(seconds) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000))
}

async function animateNodes(testString) {
  const path = test(testString) // This is line 203 - the path variable
  const timing = 0.5
  // Store the sequence data globally for the View Sequence functionality
  const accepted = path[path.length - 1].accepts && path.length - 1 === testString.length

  // Store the test sequence data with node labels
  const sequenceData = {
    path: path.map((state) => ({
      id: state.id,
      label: nodes.get(state.id)?.label || state.id.toString(),
      accepts: state.accepts,
    })),
    testString: testString,
    accepted: accepted,
  }

  // Store globally so React component can access it
  window.lastTestSequenceData = sequenceData

  // Animate the nodes
  for (const node of path) {
    nodes.update({ id: node.id, color: "#f1ff75" })
    await sleep(timing)
    nodes.update({ id: node.id, color: "#f0f0f0" })
  }

  const finalColor = accepted ? "#b3ffab" : "#f07f7f"
  nodes.update({ id: path[path.length - 1].id, color: finalColor })
  await sleep(timing)

  // Use custom popup instead of browser alert
  if (window.showTestResult) {
    window.showTestResult(accepted, testString)
  }

  nodes.update({ id: path[path.length - 1].id, color: "#f0f0f0" })
}

// Node counter
const nodeCounter = document.getElementById("node-counter")

// Function to update the node counter
function updateNodeCounter() {
  nodeCounter.textContent = `States: ${currentStateCount}`
}

// Function to update the node positions
function updateNodePositions() {
  const spacing = 80 // Space between nodes
  const allNodes = nodes.get({
    filter: (node) => node.id !== -1,
  })
  const len = allNodes.length
  if (len < 2) return
  const saveNode = allNodes[len - 2]
  const x = network.getPositions([saveNode.id])[saveNode.id].x
  const y = network.getPositions([saveNode.id])[saveNode.id].y
  const lastNode = allNodes[len - 1]
  nodes.update({ id: lastNode.id, x: x + spacing, y: y })
}

// Function to update the input alphabet list
function updateInputList() {
  inputList.innerHTML = Array.from(inputs)
    .map(
      (input) => `
            <div onclick="handleInputClick('${input}')">${input}</div>
        `,
    )
    .join("")
}

// Function to handle input alphabet click (rename/delete) - made async
async function handleInputClick(input) {
  if (!window.showCustomChoice) return

  const action = await window.showCustomChoice("Input Action", `Choose action for "${input}":`, "Rename", "Delete")

  if (action === "1") {
    if (!window.showCustomPrompt) return

    const newName = await window.showCustomPrompt("Rename Input", `Enter new name for "${input}":`)

    if (newName && newName.length === 1) {
      renameInput(input, newName)
      updateInputList()
      for (const edge of edges.get()) {
        if (edge.label) {
          let arr = edge.label.split(",")
          if (arr.includes(input)) {
            for (let i = 0; i < arr.length; i++) {
              if (arr[i] == input) {
                arr[i] = newName
              }
            }
          }
          arr = [...new Set(arr)]
          edges.update({ id: edge.id, label: arr.join() })
        }
      }
    } else if (newName !== null) {
      if (window.showInPageAlert) {
        window.showInPageAlert("Input value must be a single character.", "warning")
      }
    }
  } else if (action === "2") {
    deleteInput(input)
    updateInputList()
    for (const edge of edges.get()) {
      if (edge.label) {
        let arr = edge.label.split(",")
        if (arr.includes(input)) {
          if (arr.length === 1) {
            edges.remove(edge.id)
          } else {
            arr = arr.filter((item) => item !== input)
            arr = [...new Set(arr)]
            edges.update({ id: edge.id, label: arr.join() })
          }
        }
      }
    }
  }
}

// Make handleInputClick available globally
window.handleInputClick = handleInputClick

// Initialize the node counter and input list
updateNodeCounter()
updateInputList()
updateNodePositions()

//#endregion

//#region Buttons
// Add State Button
document.getElementById("add-state").addEventListener("click", async () => {
  clearSelections()
  if (currentStateCount >= 10) {
    if (window.showInPageAlert) {
      window.showInPageAlert("Maximum number of states (10) reached.", "warning")
    }
  } else {
    if (!window.showCustomPrompt) return

    const stateName = await window.showCustomPrompt("Add State", "Enter a name for the new state:")

    if (stateName) {
      const newState = addState()
      if (newState) {
        nodes.add({ id: newState.id, label: stateName, color: "#f0f0f0" })
        updateNodeCounter()
        if (edges.length === 0 || true) {
          updateNodePositions()
        }
      }
    }
  }
})

// Remove State Button
document.getElementById("remove-state").addEventListener("click", () => {
  clearSelections()
  if (currentStateCount === 1) {
    if (window.showInPageAlert) {
      window.showInPageAlert("You must have at least one state.", "warning")
    }
  } else {
    isRemovingState = true
    if (window.showInPageAlert) {
      window.showInPageAlert("Click on a state in the diagram to remove it.", "info")
    }
  }
})

// Rename State Button
document.getElementById("rename-state").addEventListener("click", () => {
  clearSelections()
  isRenamingState = true
  if (window.showInPageAlert) {
    window.showInPageAlert("Click on a state in the diagram to rename it.", "info")
  }
})

// Setting Start State Button
document.getElementById("set-start-state").addEventListener("click", () => {
  clearSelections()
  isSettingStartState = true
  if (window.showInPageAlert) {
    window.showInPageAlert("Click on a state in the diagram to make it the starting state.", "info")
  }
})

// Switch Accepting Button
document.getElementById("switch-accepting").addEventListener("click", () => {
  clearSelections()
  isSwitchingAccepting = true
  if (window.showInPageAlert) {
    window.showInPageAlert("Click on a state in the diagram to toggle whether it is accepting or not.", "info")
  }
})

// Add Link Button
document.getElementById("add-link").addEventListener("click", () => {
  clearSelections()
  isAddingLink = true
  if (window.showInPageAlert) {
    window.showInPageAlert("Click on a state in the diagram as the source node.", "info")
  }
})

// Remove Link Button
document.getElementById("remove-link").addEventListener("click", () => {
  clearSelections()
  isRemovingLink = true
  if (window.showInPageAlert) {
    window.showInPageAlert("Click on a transition in the diagram to remove it.", "info")
  }
})

// Test Button
document.getElementById("test").addEventListener("click", async () => {
  clearSelections()
  if (startId === null) {
    if (window.showInPageAlert) {
      window.showInPageAlert("Set a starting state before testing.", "warning")
    }
  } else {
    if (!window.showCustomPrompt) return

    const testString = await window.showCustomPrompt("Test String", "Enter a string to test:")
    if (testString !== null) {
      animateNodes(testString)
    }
  }
})

// Add Input Button
addInputButton.addEventListener("click", async () => {
  if (inputs.size >= 10) {
    if (window.showInPageAlert) {
      window.showInPageAlert("Maximum number of inputs (10) reached.", "warning")
    }
  } else {
    if (!window.showCustomPrompt) return

    const inputVal = await window.showCustomPrompt("Add Input", "Enter a new input value (1 character):")
    if (inputVal && inputVal !== " " && inputVal.length === 1) {
      addInput(inputVal)
      updateInputList()
    } else if (inputVal !== null) {
      if (window.showInPageAlert) {
        window.showInPageAlert("Input value must be a single character.", "warning")
      }
    }
  }
})

//#endregion

// Network event listeners
network.on("click", async (event) => {
  const { nodes: clickedNodes, edges: clickedEdges } = event

  if (isRemovingState && clickedNodes.length > 0) {
    const stateId = clickedNodes[0]
    if (stateId !== -1) {
      removeState(stateId)
      nodes.remove(stateId)
      updateNodeCounter()
      isRemovingState = false

      // Hide the alert when user completes the action
      if (window.hideInPageAlert) {
        window.hideInPageAlert()
      }
    }
  }

  if (isRenamingState && clickedNodes.length > 0) {
    const stateId = clickedNodes[0]
    if (!window.showCustomPrompt) return

    const newName = await window.showCustomPrompt("Rename State", "Enter a new name for the state:")
    if (newName) {
      nodes.update({ id: stateId, label: newName })
    }
    isRenamingState = false

    if (window.hideInPageAlert) {
      window.hideInPageAlert()
    }
  }

  if (isSettingStartState && clickedNodes.length > 0) {
    const stateId = clickedNodes[0]
    if (startId !== null) {
      edges.remove(network.getConnectedEdges(-1))
      nodes.remove(-1)
    }
    startId = stateId
    const nodePosition = network.getPositions([startId])[startId]
    nodes.add({ id: -1, color: "transparent", x: nodePosition.x - 100, y: nodePosition.y })
    edges.add({
      from: -1,
      to: startId,
      arrows: "to",
      smooth: { enabled: false },
    })

    isSettingStartState = false

    if (window.hideInPageAlert) {
      window.hideInPageAlert()
    }
  }

  if (isSwitchingAccepting && clickedNodes.length > 0) {
    const stateId = clickedNodes[0]
    const state = findState(stateId)
    state.accepts = !state.accepts
    if (state.accepts) {
      nodes.update({ id: stateId, borderWidth: 5 })
    } else {
      nodes.update({ id: stateId, borderWidth: 2 })
    }
    isSwitchingAccepting = false

    // Hide the alert when user completes the action
    if (window.hideInPageAlert) {
      window.hideInPageAlert()
    }
  }

  if (isAddingLink && clickedNodes.length > 0) {
    if (linkSourceNode === null) {
      linkSourceNode = clickedNodes[0]
      if (window.showInPageAlert) {
        window.showInPageAlert("Click on a state in the diagram as the destination node.", "info")
      }
    } else {
      linkDestNode = clickedNodes[0]
      if (!window.showCustomPrompt) return

      const inputVal = await window.showCustomPrompt(
        "Add Transition",
        "Enter the input value for the transition (1 character):",
      )

      if (inputVal) {
        const addingNewInput = !inputs.has(inputVal) && inputs.size < 10
        const isValidInput = inputVal !== " " && inputVal.length === 1
        if (addingNewInput) {
          if (isValidInput) {
            addInput(inputVal)
            updateInputList()
          } else {
            if (window.showInPageAlert) {
              window.showInPageAlert("Input value must be a single character.", "warning")
            }
          }
        }

        if (inputs.has(inputVal) || (addingNewInput && isValidInput)) {
          addLink(linkSourceNode, linkDestNode, inputVal)
          let existingLinkId = null
          for (const edge of edges.get()) {
            if (edge.from === linkSourceNode && edge.to === linkDestNode) {
              existingLinkId = edge.id
            }
          }
          if (existingLinkId === null) {
            edges.add({
              from: linkSourceNode,
              to: linkDestNode,
              label: inputVal,
            })
          } else {
            const edge = edges.get(existingLinkId)
            const prevLabel = edge.label
            if (!prevLabel.includes(inputVal)) {
              edges.update({ id: existingLinkId, label: prevLabel + "," + inputVal })
            }
          }
          if (window.hideInPageAlert) {
            window.hideInPageAlert()
          }
        } else {
          if (window.showInPageAlert) {
            window.showInPageAlert("Invalid input value.", "warning")
          }
        }
      }
      linkSourceNode = null
      isAddingLink = false
    }
  }

  if (isRemovingLink && clickedEdges.length > 0) {
    const edge = edges.get(clickedEdges[0])
    if (edge && edge.label) {
      removeLink(edge.from, edge.label)
      edges.remove(clickedEdges[0])
    }
    isRemovingLink = false

    // Hide the alert when user completes the action
    if (window.hideInPageAlert) {
      window.hideInPageAlert()
    }
  }
})
