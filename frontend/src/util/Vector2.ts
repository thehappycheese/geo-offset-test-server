export default class Vector2 {
    x:number;
    y:number;
    constructor(x=0, y=0){
        this.x = x;
        this.y = y;
    }
    clone(){
        return new Vector2(this.x, this.y);
    }
    add(other:Vector2){
        return new Vector2(
            this.x + other.x,
            this.y + other.y,
        )
    }
    sub(other:Vector2){
        return new Vector2(
            this.x - other.x,
            this.y - other.y,
        )
    }
    mul(scalar:number){
        return new Vector2(
            this.x * scalar,
            this.y * scalar,
        )
    }
    div(scalar:number){
        return new Vector2(
            this.x / scalar,
            this.y / scalar,
        )
    }
    dot(other:Vector2){
        return this.x*other.x + this.y*other.y;
    }
    cross(other:Vector2){
        return this.x * other.y - this.y * other.x;
    }
    left(){
        return new Vector2(
            this.y,
            -this.x,
        )
    }
    right(){
        return new Vector2(
            -this.y,
            this.x,
        )
    }
    unit(){
        let len = Math.sqrt(this.x*this.x+this.y*this.y);
        return new Vector2(
            this.x/len,
            this.y/len,
        )
    }
    len(){
        return Math.sqrt(this.x*this.x+this.y*this.y);
    }
    ang(){
        return Math.atan2(this.y, this.x)
    }

    toString(){
        return `[${this.x.toFixed(2)} ${this.y.toFixed(2)}]`
    }

    distance_to(other:Vector2){
        let dx = other.x - this.x;
        let dy = other.y - this.y;
        return Math.sqrt(dx*dx + dy*dy);
    }
}