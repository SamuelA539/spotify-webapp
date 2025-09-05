export class FetchError extends Error 
{
    constructor(msg) {
        super()
        this.message = msg
    }
}

export class DataError extends Error 
{
    constructor(msg) {
        super(msg)
        this.message = msg
    }
}