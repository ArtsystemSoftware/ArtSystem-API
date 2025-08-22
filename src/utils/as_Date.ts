class as_Date extends Date {
    private timeZone: string;
    
    constructor(datetime: Date | string | number = new Date().toISOString(), timeZone: string = 'America/Sao_Paulo' ) {
        
        if (typeof datetime === 'string') {
            datetime = new Date(datetime)
        } else 
        if (typeof datetime === 'number') {
            datetime = new Date(datetime  + new Date().getTimezoneOffset() * 60 * 1000)
        }
        else {
            datetime = new Date(datetime.getTime() + datetime.getTimezoneOffset() * 60 * 1000); 
        }

        datetime = as_Date.as_getDateInTimeZone(datetime, timeZone)
        
        // super(datetime.getTime() + datetime.getTimezoneOffset()*60*1000); 
        super(datetime.getTime()); 
        this.timeZone = timeZone;
        
    }
    
    // Static method to create a Date object in the given time zone
    private static as_getDateInTimeZone(datetime: Date,timeZone: string): Date {
        
        const timeZoneDateStr = datetime.toLocaleString('en-US', {  
            timeZone,
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false });

        // Extract date and time components from the locale string
        const [month, day, year, hour, minute, second] = timeZoneDateStr.match(/\d+/g)!;
        const milliseconds = datetime.getMilliseconds().toString().padStart(3, '0');
       
        return new Date(`${year}-${month}-${day}T${Number(hour) < 24 ? hour: '00'}:${minute}:${second}.${milliseconds}Z`);
    }

    public as_toString(): string {
        const timeZoneDateStr = this.toLocaleString('en-US', {  
            timeZone:'America/Sao_Paulo',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false });

        // Extract date and time components from the locale string
        const [month, day, year, hour, minute, second] = timeZoneDateStr.match(/\d+/g)!;
        
        const milliseconds =  this.getMilliseconds().toString().padStart(3, '0');

        return `${day}/${month}/${year} ${Number(hour) < 24 ? hour: '00'}:${minute}:${second}`;
    }

    public as_toISOString(): string {
   
        const timeZoneDateStr = this.toISOString();
        const [year, month, day, hour, minute, second] = timeZoneDateStr.match(/\d+/g)!;
        
        return `${day}/${month}/${year} ${Number(hour) < 24 ? hour : '00'}:${minute}:${second}`;
    }

    public static as_now(timeZone: string = 'America/Sao_Paulo'): as_Date {
        // console.log('as_now() - TimeZone:', timeZone);
        return new as_Date(new Date(),timeZone);
    }


}

export { as_Date };
