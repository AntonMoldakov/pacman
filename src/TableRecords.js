import { loadImage, loadJSON } from './Loader.js'
import Game from './Game.js'
import Group from './Group.js'
import Text from './Text.js'
const tableContainer = document.getElementById('tableRecords')
const fs = require('fs')
export async function addToTheTableRecords(playerName, score) {

    let tableRecordsPlayers = await loadJSON('./sets/table-records.json')
    tableRecordsPlayers = tableRecordsPlayers.tableRecords

    let newRecord = {
        name: playerName,
        recordScore: score
    }
    tableRecordsPlayers.push(newRecord)
    tableRecordsPlayers = {
        tableRecordsPlayers
    }
    let jsonTableRecords = JSON.stringify(tableRecordsPlayers);
    
    // fs.truncate('./sets/table-records.json', err => {
    //     if(err) throw err
    // })
    // fs.writeFileSync("./sets/table-records.json", jsonTableRecords,  "ascii")
}
export async function tableRecords() {

    let tableRecordsPlayers = await loadJSON('./sets/table-records.json')
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

    const party = new Group()
    table.stage.add(party)
    tableContainer.append(table.canvas)
    table.stage.add(titleTable)

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
    tableRecords,
    addToTheTableRecords
}