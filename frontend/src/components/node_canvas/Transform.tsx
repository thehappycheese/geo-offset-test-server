import Vector2 from "../../util/Vector2";

export class Transform {
    // consider to be immutable
    #translate: Vector2;
    #scale: number;
    constructor(translation?: Vector2, scale?: number) {
        this.#translate = translation ?? new Vector2();
        this.#scale = scale ?? 1;
    }
    get scale(){
        return this.#scale;
    }
    get translation(){
        // Defensively clone to avoid leeking :/
        return this.#translate;
    }
    clone() {
        return new Transform(this.#translate.clone(), this.#scale);
    }
    clone_with_translate(new_translation: Vector2) {
        return new Transform(new_translation, this.#scale);
    }
    clone_with_scale(new_scale: number) {
        return new Transform(this.#translate.clone(), new_scale);
    }
    world_to_screen(point: Vector2) {
        return point.add(this.#translate).mul(this.#scale);
    }
    screen_to_world(point) {
        return point.div(this.#scale).sub(this.#translate);
    }
    toString() {
        return `(p+${this.#translate.toString()})*${this.#scale}`;
    }
}
