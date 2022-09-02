export enum LogsTypes {
    error = 'error',
    access_denied = 'access_denied',
    warning = 'warning',
    success = 'success'
}

export class Filters {
    startDate?: Date
    endDate?: Date
    master?: string
    action?: string
    type?: string
    datas?: string

    toString() {
        console.log('filters toString')
        return this.master
    }
}