export class Conditions{
    public static clone(c:Conditions[]|null): Conditions[]{
        return c!.map(c => new Conditions(c.source,c.pattern))
    }


    constructor(
        public source : string,
        public pattern : string
    ){}
}


