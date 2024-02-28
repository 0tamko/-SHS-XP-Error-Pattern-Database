import { Conditions } from "./conditions";

export class Event{

    public static clone(r:Event): Event{
        return new Event(r.id,r.type,r.conditions,r.operator,r.members)
    }


    constructor(
        public id : number,
        public type: EventType,
        public conditions: Conditions[] | null, //prec
        public operator: Relation |null,
        public members: Event[]  | null,
        public notState: boolean = false
    ){}
}

export enum EventType{
    message,
    relationShip
}


export class Relation{
    constructor(
        public name : string = "",
        public value : number | null = null
    ){}
}