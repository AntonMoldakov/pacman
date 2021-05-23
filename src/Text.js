import DisplayObject from "./DisplayObject.js";

export default class Text extends DisplayObject {
    constructor (props = {}) {
        super(props)

        this.font = props.font ?? "14px 'Press Start 2P'"
        this.content = props.content ?? ""
        this.fill = props.fill ?? "white"
        this.textAlign = props.textAlign ?? "center"
    }

    draw (context) {
        context.beginPath()
        context.font = this.font
        context.fillStyle = this.fill
        context.textAlign =  this.textAlign
        context.fillText(this.content, this.x, this.y)
    }
}