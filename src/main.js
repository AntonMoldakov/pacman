import Game from './Game.js'
import { loadImage, loadJSON } from './Loader.js'
import Sprite from './Sprite.js'
import Cinematic from './Cinematic.js'
import { haveCollision, getRandomFrom } from './Additional.js'
import DisplayObject from './DisplayObject.js'
import Group from './Group.js'
import Text from './Text.js'
import { addToTheTableRecords } from './TableRecords.js'

const scale = 2
let speedValue = 1
let direction
let gameContainer = document.getElementById('game')

export default async function main() {
    const game = new Game({
        // width: 672,
        // height: 800,
        width: 450,
        height: 550,
        background: 'black'
    })

    const party = new Group()
    party.offsetY = 50
    game.stage.add(party)

    const status = new Text({
        x: game.canvas.width / 2,
        y: 40,
        content: "0 score",
        fill: 'white',
    })

    const speedMode = new Text({
        x: game.canvas.width / 5,
        y: 40,
        content: "Slow",
        fill: 'white',
    })

    const GameOver = new Text({
        x: game.canvas.width / 2,
        y: game.canvas.height / 2.25,
        font: "18px 'Press Start 2P'",
        content: "",
        fill: 'orange',
    })

    status.points = 0
    game.stage.add(status)
    game.stage.add(speedMode)
    game.stage.add(GameOver)
    gameContainer.append(game.canvas)

    const image = await loadImage('./sets/spritesheet.png')
    const atlas = await loadJSON('./sets/atlas.json')

    const maze = new Sprite({
        image,
        x: 0,
        y: 0,
        width: atlas.maze.width * scale,
        height: atlas.maze.height * scale,
        frame: atlas.maze
    })
    // game.canvas.width = maze.width
    // game.canvas.height = maze.height

    let foods = atlas.maze.foods
        .map(food => ({
            ...food,
            x: food.x * scale,
            y: food.y * scale,
            width: food.width * scale,
            height: food.height * scale,
        }))
        .map(food => new Sprite({
            image,
            frame: atlas.food,
            ...food
        }))

    const pacman = new Cinematic({
        image,
        x: atlas.position.pacman.x * scale,
        y: atlas.position.pacman.y * scale,
        width: 15 * scale,
        height: 15 * scale,
        animations: atlas.pacman,
        // debug: true,
        speedX: 1
    })
    pacman.start('right')

    const ghosts = ['red', 'pink', 'turquoise', 'banana']
        .map(color => {
            const ghost = new Cinematic({
                image,
                x: atlas.position[color].x * scale,
                y: atlas.position[color].y * scale,
                width: 14 * scale,
                height: 14 * scale,
                name: `${color}Ghost`,
                animations: atlas[`${color}Ghost`],
                // debug: true,
            })
            ghost.start(atlas.position[color].direction)
            ghost.nextDirection = atlas.position[color].direction
            ghost.isBlue = false

            return ghost
        })

    const walls = atlas.maze.walls.map(wall => new DisplayObject({
        x: wall.x * scale,
        y: wall.y * scale,
        width: wall.width * scale,
        height: wall.height * scale,
        // debug: true,
    }))

    const leftPortal = new DisplayObject({
        x: atlas.position.leftPortal.x * scale,
        y: atlas.position.leftPortal.y * scale,
        width: atlas.position.leftPortal.width * scale,
        height: atlas.position.leftPortal.height * scale,
        // debug: true,
    })

    const rightPortal = new DisplayObject({
        x: atlas.position.rightPortal.x * scale,
        y: atlas.position.rightPortal.y * scale,
        width: atlas.position.rightPortal.width * scale,
        height: atlas.position.rightPortal.height * scale,
        // debug: true,
    })

    let viewFields = [];

    for (let i = 0; i < ghosts.length; i++) {
        viewFields[i] = new DisplayObject({
            name: ghosts[i].name,
            x: 0,
            y: 0,
            width: 0,
            height: 0,
            debug: false,
        })
        party.add(viewFields[i])
    }
    const tablets = atlas.position.tablets
        .map(tablet => new Sprite({
            image,
            frame: atlas.tablet,
            x: tablet.x * scale,
            y: tablet.y * scale,
            width: tablet.width * scale,
            height: tablet.height * scale,
        }))



    party.add(maze)
    foods.forEach(food => party.add(food))
    party.add(pacman)
    ghosts.forEach(ghost => party.add(ghost))
    walls.forEach(wall => party.add(wall))
    party.add(leftPortal)
    party.add(rightPortal)
    tablets.forEach(tablet => party.add(tablet))

    game.update = () => {
        // Проверка съеденой еды
        const eated = []
        for (const food of foods) {
            if (haveCollision(pacman, food)) {
                eated.push(food)
                party.remove(food)
                status.points += 100
                status.content = `${status.points} score`
            }
        }
        foods = foods.filter(food => !eated.includes(food))

        // Смена направления движения
        changeDirecton(pacman)
        ghosts.forEach(changeDirecton)

        // Поле зрения
        function fieldOfView(ghost) {
            viewFields.map(field => {
                if (field.name === ghost.name) {
                    party.remove(field)
                    if (ghost.animation.name === 'right') {
                        field.x = ghost.x
                        field.y = ghost.y
                        field.width = ghost.width * 5
                        field.height = ghost.width
                    } else if (ghost.animation.name === 'left') {
                        field.x = ghost.x - (ghost.width * 5)
                        field.y = ghost.y
                        field.width = ghost.width * 5
                        field.height = ghost.width
                    } else if (ghost.animation.name === 'down') {
                        field.x = ghost.x
                        field.y = ghost.y
                        field.width = ghost.width
                        field.height = ghost.width * 5
                    } else if (ghost.animation.name === 'up') {
                        field.x = ghost.x
                        field.y = ghost.y - (ghost.width * 5)
                        field.width = ghost.width
                        field.height = ghost.width * 5
                    }
                    party.add(field)
                }
            })
        }

        // Проверка попадания в поле зрения 
        function hittingTheFieldOfView(ghost) {
            let result
            if (ghost.animation.name === 'right' || ghost.animation.name === 'left') {
                viewFields.map(field => {
                    if (field.name === ghost.name) {
                        let width = field.width
                        field.width /= 20

                        while (field.width <= width) {
                            party.remove(field)
                            field.width += 20
                            party.add(field)
                            result = haveCollision(field, pacman)
                            if (result) return result
                        }
                    }
                })
            }
            if (ghost.animation.name === 'top' || ghost.animation.name === 'down') {
                viewFields.map(field => {
                    if (field.name === ghost.name) {
                        let height = field.height
                        field.height /= 20

                        while (field.height <= height) {
                            party.remove(field)
                            field.height += 20
                            party.add(field)
                            result = haveCollision(field, pacman)
                            if (result) return result
                        }
                    }
                })
            }
            return result
        }

        //Жив ли pacman
        if (!pacman.play) {
            GameOver.content = 'Game Over'
        }

        function gameOver() {
            let userName = prompt(`у вас ${status.points} очков сохраните ваш результат`,'Player')
            console.log(userName)
            if (userName )
            addToTheTableRecords(userName,status.points)
        }

        // Жизнь призрака
        for (const ghost of ghosts) {
            if (!ghost.play) {
                continue
            }

            if (!pacman.play) {
                ghost.speedX = 0
                ghost.speedY = 0
                continue
            }

            fieldOfView(ghost)

            const wall = getWallCollition(ghost.getNextPosition())

            if (wall) {
                ghost.speedX = 0
                ghost.speedY = 0
            }

            let chanceTurning = 0.98
            let ch = Math.random()

            if (hittingTheFieldOfView(ghost)) {
                (!ghost.isBlue) ? chanceTurning = 1 : chanceTurning = 0.5
            }

            if ((ghost.speedX === 0 && ghost.speedY === 0) || ch > chanceTurning) {
                if (ghost.animation.name === 'up') {
                    ghost.nextDirection = getRandomFrom('left', 'right')
                }

                else if (ghost.animation.name === 'down') {
                    ghost.nextDirection = getRandomFrom('left', 'right')
                }

                else if (ghost.animation.name === 'left') {
                    ghost.nextDirection = getRandomFrom('up', 'down')
                }

                else if (ghost.animation.name === 'right') {
                    ghost.nextDirection = getRandomFrom('up', 'down')
                }
            }

            // Телепортация
            if (haveCollision(ghost, leftPortal)) {
                ghost.x = atlas.position.rightPortal.x * scale - ghost.width - 1
            }

            if (haveCollision(ghost, rightPortal)) {
                ghost.x = atlas.position.leftPortal.x * scale + ghost.width + 1
            }

            if (pacman.play && ghost.play && haveCollision(pacman, ghost)) {
                if (ghost.isBlue) {
                    setTimeout(() => {
                        // Возрождение призрака
                        ghost.x = game.canvas.width / 2
                        ghost.y = game.canvas.height / 2.07
                        ghost.speedX = oldSpeedX
                        ghost.speedY = oldSpeedY
                        ghost.play = true
                        party.add(ghost)
                    }, 5000)
                    let oldSpeedX = ghost.speedX
                    let oldSpeedY = ghost.speedY
                    ghost.play = false
                    ghost.speedX = 0
                    ghost.speedY = 0
                    party.remove(ghost)

                    status.points += 1000
                    status.content = `${status.points} score`
                } else {
                    pacman.speedX = 0
                    pacman.speedY = 0
                    pacman.play = false
                    pacman.start('die', {
                        onEnd() {
                            pacman.stop()
                            party.remove(pacman)
                        }
                    })
                    setTimeout(gameOver,2000)
                }
            }
        }

        // Проверка столкновения pacman со стеной
        const wall = getWallCollition(pacman.getNextPosition())
        if (wall) {
            pacman.start(`wait${pacman.animation.name}`)
            pacman.speedX = 0
            pacman.speedY = 0
        }

        // Телепортация
        if (haveCollision(pacman, leftPortal)) {
            pacman.x = atlas.position.rightPortal.x * scale - pacman.width - 1
        }

        if (haveCollision(pacman, rightPortal)) {
            pacman.x = atlas.position.leftPortal.x * scale + pacman.width + 1
        }

        // Поедание таблеток
        for (let i = 0; i < tablets.length; i++) {
            const tablet = tablets[i]
            let tabletEffectEnd

            if (haveCollision(pacman, tablet)) {
                tablets.splice(i, 1)
                party.remove(tablet)

                if (ghosts[0].isBlue) {
                    clearTimeout(tabletEffectEnd)
                }

                ghosts.forEach((ghost, i) => {
                    if (!ghost.isBlue) {
                        ghost.originalAnimations = ghost.animations
                    }
                    ghost.animations = atlas.blueGhost
                    ghost.isBlue = true
                    ghost.start(ghost.animation.name)
                })

                tabletEffectEnd = setTimeout(() => {
                    ghosts.forEach(ghost => {
                        ghost.animations = ghost.originalAnimations
                        ghost.isBlue = false
                        ghost.start(ghost.animation.name)
                    })
                }, 5000)

            }
        }
    }

    document.addEventListener('keydown', event => {
        if (event.keyCode === 82) {
            location.reload()
        }

        if (event.keyCode === 68) {
            if (pacman.debug) {
                party.items.map((e, i) => (i == 0) ? null : e.debug = false)
            } else {
                party.items.map((e, i) => (i == 0) ? null : e.debug = true)
            }
        }

        if (!pacman.play) {
            return
        }

        if (event.key === "ArrowLeft") {
            direction = 'left'
        }

        else if (event.key === 'ArrowRight') {
            direction = 'right'
        }

        else if (event.key === 'ArrowUp') {
            direction = 'up'
        }

        else if (event.key === 'ArrowDown') {
            direction = 'down'
        }

        else if (event.keyCode === 85) {
            speedMode.content = "Fast"
            speedValue = 3
        }
        else if (event.keyCode === 73) {
            speedMode.content = "Slow"
            speedValue = 1
        }
        pacman.nextDirection = direction

    })

    function getWallCollition(obj) {
        for (const wall of walls) {
            if (haveCollision(wall, obj)) {
                return wall
            }
        }

        return null
    }

    function changeDirecton(sprite) {
        if (!sprite.nextDirection) {
            return
        }

        if (sprite.nextDirection === 'up') {
            sprite.y -= 10
            if (!getWallCollition(sprite)) {
                sprite.nextDirection = null
                sprite.speedX = 0
                sprite.speedY = -1 * speedValue
                sprite.start('up')
            }
            sprite.y += 10
        }

        else if (sprite.nextDirection === 'down') {
            sprite.y += 10
            if (!getWallCollition(sprite)) {
                sprite.nextDirection = null
                sprite.speedX = 0
                sprite.speedY = 1 * speedValue
                sprite.start('down')
            }
            sprite.y -= 10
        }

        else if (sprite.nextDirection === 'left') {
            sprite.x -= 10
            if (!getWallCollition(sprite)) {
                sprite.nextDirection = null
                sprite.speedX = -1 * speedValue
                sprite.speedY = 0
                sprite.start('left')
            }
            sprite.x += 10
        }

        else if (sprite.nextDirection === 'right') {
            sprite.x += 10
            if (!getWallCollition(sprite)) {
                sprite.nextDirection = null
                sprite.speedX = 1 * speedValue
                sprite.speedY = 0
                sprite.start('right')
            }
            sprite.x -= 10
        }
    }
}