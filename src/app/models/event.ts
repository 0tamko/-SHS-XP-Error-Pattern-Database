import { Conditions } from "./conditions";

export class Event{

    public static clone(r:Event): Event{
        return new Event(r.id,r.conditions,r.terminate)
    }


    constructor(
        public id : number,
        public conditions: Conditions[] | null,
        public terminate : boolean = false,
    ){}
}
