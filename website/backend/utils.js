export class Utils {
    
    static query_from_string(text) {
        let query = {};

        if (text.indexOf('?') > -1) {
            let data = text.split('?')[1];

            if (data.indexOf('&') > -1) {
                data = data.split('\&');
                for (let idx = 0; idx < data.length; idx++) {
                    const entry = data[idx].split('=');
                    query[entry[0]] = entry[1];
                }

            } else {
                const entry = data.split('=');
                query[entry[0]] = entry[1];
            }
        }

        return query;
    }

    static get_date_and_time_as_string() {
        const date_ob = new Date();

        const day = ("0" + date_ob.getDate()).slice(-2);
        const month = ("0" + (date_ob.getMonth() + 1)).slice(-2);
        const year = date_ob.getFullYear();

        const hours = date_ob.getHours();
        const minutes = date_ob.getMinutes();
        const seconds = date_ob.getSeconds();

        const date_string = this.string_pad_with_zeros(year, 4) +
                            this.string_pad_with_zeros(month, 2) +
                            this.string_pad_with_zeros(day, 2) +
                            "_" +
                            this.string_pad_with_zeros(hours, 2) +
                            this.string_pad_with_zeros(minutes, 2) +
                            this.string_pad_with_zeros(seconds, 2);
        return date_string;
    }

    static string_pad_with_zeros(text, num_digits) {
        text = String(text);
        while (text.length < num_digits) text = "0" + text;
        return text;
    }
}