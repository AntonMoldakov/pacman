import { loadImage, loadJSON } from './Loader.js'
import Game from './Game.js'
import Group from './Group.js'
import Text from './Text.js'

export async function addToTheTableRecords(playerName, score) {

    let tableRecordsPlayers = await loadJSON('./sets/tableRecords.json')
    let tableRecords = tableRecordsPlayers.tableRecords

    let newRecord = {
        name: playerName,
        recordScore: score
    }
    tableRecords.push(newRecord)

    let data = JSON.stringify({ tableRecords })

    var request = new XMLHttpRequest()
    request.open("POST", "http://localhost:3000")
    request.setRequestHeader('Content-type', 'application/json; charset=utf-8')

    request.send(data)
    setTimeout(tableRecordsF, 1000)
 
}



export async function tableRecordsF() {
    let tableContainer = document.getElementById('tableRecords')
    let tableRecordsPlayers = await loadJSON('./sets/tableRecords.json')
    tableRecordsPlayers = tableRecordsPlayers.tableRecords

    const table = new Game({
        width: 250,
        height: 550,
        background: 'black'
    })

    const titleTable = new Text({
        x: 20,
        y: 20,
        content: 'Table Records',
        fill: 'white',
        textAlign: 'start'
    })
    if (tableContainer.childElementCount > 0) {
        let child = tableContainer.lastChild
        tableContainer.removeChild(child)
    }

    const party = new Group()
    table.stage.add(party)
    table.stage.add(titleTable)
    tableContainer.append(table.canvas)
    

    tableRecordsPlayers.sort(function (a, b) { return b.recordScore - a.recordScore });

    tableRecordsPlayers.map((player, place) => {
        if (place < 10) {
            table.stage.add(
                new Text({
                    x: 20,
                    y: ((place + 1) * 20) + 40,
                    content: `${(place + 1)}: ${player.name} ${player.recordScore}`,
                    fill: 'white',
                    textAlign: 'start'
                })
            )
        }

    })
}

export default {
    tableRecordsF,
    addToTheTableRecords
}