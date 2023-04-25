import * as Config from './config.js';
import * as Global from './globals.js';

import { Utils } from './utils.js';

import os from 'os';
import fs from 'fs';
import moment from 'moment';

export class HtmlBuilder {

    generate(recordings_dir) {
        this.#delete_too_old_recordings(recordings_dir);

        const path_to_html_file = "/usr/app/website/frontend/recordings.html";
        this.#write_html(path_to_html_file, recordings_dir);
    }

    #get_recordings(recordings_dir) {
        try {
            const recordings = [];

            let idx = 0;
            fs.readdirSync(recordings_dir).forEach(file => {
                if (String(file).endsWith(".ogg")) {
                    recordings[idx++] = file;
                }
            });

            recordings.sort();

            return recordings;
        } catch(error) {
            return [];
        }

    }

    #write_html(path_to_html_file, recordings_dir) {
        const content = this.#generate_html_content(recordings_dir);

        fs.writeFile(path_to_html_file, content, function(err) {
            if(err) {
                return console.log(err);
            }
            console.log("The file was saved!");
        });
    }

    #generate_html_content(recordings_dir) {
        let text = '<h3>Aufnahmen</h3>' + os.EOL + os.EOL;

        text += '<div class="container text-center">' + os.EOL;
        text += '    <div class="row">' + os.EOL;

        const recordings = this.#get_recordings(recordings_dir);
        recordings.forEach(filename => {
            const date = this.#get_date_from_filename(filename);
            const time = this.#get_time_from_filename(filename);

            text += '       <div class="col">' + os.EOL;
            text += '           <audio preload="meta" controls="controls">' + os.EOL;
            text += '               <source src="' + recordings_dir + '/' + filename + '" type="audio/ogg">' + os.EOL;
            text += '               Your browser does not support the audio tag.' + os.EOL;
            text += '           </audio>' + os.EOL;
            text += '           <p>' + date + ' ' + time + '</p>' + os.EOL;
            text += '       </div>' + os.EOL;
        })

        text += '   </div>' + os.EOL;
        text += '</div>'

        return text;
    }

    #get_date_from_filename(filename) {
        let date = (String(filename).split(".")[0]).split("_")[1];
        date = date.substring(6, 8) + "." + date.substring(4,6) + "." + date.substring(0,4);

        return date;
    }

    #get_time_from_filename(filename) {
        let time = (String(filename).split(".")[0]).split("_")[2];
        time = time.substring(0,2) + ":" + time.substring(2,4);

        return time;
    }

    #delete_too_old_recordings(recordings_dir) {
        const end_date_string = Utils.get_date_and_time_as_string().split("_")[0];
        const end_date = moment(end_date_string, "YYYYMDD");

        const too_old_recordings = [];
        let idx = 0;

        const recordings = this.#get_recordings(recordings_dir);
        recordings.forEach(filename => {
            const date_string = this.#get_date_from_filename(filename);
            const start_date = moment(date_string, "DD.M.YYYY");

            const duration = end_date.diff(start_date, 'hours') / 24;

            if (duration > 14) {
                too_old_recordings[idx++] = filename;
            }
        })

        too_old_recordings.forEach(filename => {
            const full_filename = recordings_dir + "/" + filename;
            fs.unlink(recordings_dir + "/" + filename,function(err){
                if(err) return console.log(err);
                console.log('Recording ' + full_filename + ' deleted successfully');
            });
        })
    }
}