const fs = require('graceful-fs');
const lunr = require('lunr');
const nodejieba = require("nodejieba");
const papa = require('papaparse');
const path = require('path');
var kuromoji = require("kuromoji");
// Add timestamp to logs
require('console-stamp')(console, 'yyyy-mm-dd HH:MM:ss');

require('../node_modules/lunr-languages/lunr.multi.js')(lunr);
require('../node_modules/lunr-languages/lunr.stemmer.support.js')(lunr);
require('../node_modules/lunr-languages/tinyseg.js')(lunr);
require('../node_modules/lunr-languages/lunr.jp.js')(lunr);

require('./lunr.ch.js')(lunr, nodejieba);
require('./lunr.kr.js')(lunr, nodejieba);

function log(...msg) {
    console.log('[' + REGION + ']', '[tos-search]', ...msg);
}

const REGION_iTOS = 'iTOS';
const REGION_jTOS = 'jTOS';
const REGION_kTEST = 'kTEST';
const REGION_kTOS = 'kTOS';
const REGION_twTOS = 'twTOS';

const REGION = process.argv[2] || REGION_iTOS;
const LANGUAGE = process.argv[3] || "en";

if ([REGION_iTOS, REGION_jTOS, REGION_kTOS, REGION_kTEST, REGION_twTOS].indexOf(REGION) === -1)
    throw Error('Invalid region: ' + REGION);

let documents = {};
let folder = path.join('..', 'tos-build', 'dist', 'assets', 'data', REGION.toLowerCase(), LANGUAGE.toLowerCase());

// Load Documents
log('Loading documents...');
let files = fs.readdirSync(folder);
files.forEach((fileName) => {
    if (fileName.indexOf('.csv') === -1)
        return;
    if (fileName.startsWith('npcs'))
        return;

    log('Papa parsing ' + fileName + '...');
    let dataset = fileName.slice(0, fileName.indexOf('.'));
    let file = fs.readFileSync(path.join(folder, fileName), 'utf8');

    documents[dataset] = [];

    papa.parse(file, { dynamicTyping: true, header: true, skipEmptyLines: true })
        .data
        .forEach((row) => documents[dataset].push(row));
});
var idx;
kuromoji.builder({ dicPath: "node_modules/kuromoji/dict" }).build((err, tokenizer) => {


    // Build index
    log('Building index...');
    idx = lunr(function() {
        if (REGION === REGION_jTOS) {
            this.use(lunr.multiLanguage('en', "jp"));

        }
        if (REGION === REGION_kTOS || REGION === REGION_kTEST) {
            this.use(lunr.multiLanguage('en', 'kr'));
            // Disable stemmer
            this.pipeline.remove(lunr.stemmer);

        }
        if (REGION === REGION_twTOS) {
            this.use(lunr.multiLanguage('en', 'ch'));
            // Disable stemmer
            this.pipeline.remove(lunr.stemmer);

        }


        this.ref('$ID_lunr');
        this.field('$ID');
        this.field('$ID_NAME');
        this.field('Name');
        //this.field('Icon');
        //this.field('Description');

        if (REGION == REGION_jTOS && false) {



            Object.entries(documents)
                .forEach(value => {

                    let documents = value[1];
                    let dataset = value[0];

                    documents.forEach((doc) => {

                        if (doc['Name'] == null) {
                            //this.add({
                            //    $ID: doc['$ID'],
                            //    $ID_lunr: dataset + '#' + doc['$ID'],
                            //    $ID_NAME: doc['$ID_NAME'],
                            //    Name: doc['Name'],
                            //    //Icon: doc['Icon'],
                            //    //Description: doc['Description']
                            //});

                        } else {
                            let path = null;


                            path = tokenizer.tokenize(doc['Name']);

                            if (path != null) {
                                let iidx = 0;

                                this.add({
                                    $ID: doc['$ID'],
                                    $ID_lunr: dataset + '#' + doc['$ID'],
                                    $ID_NAME: doc['$ID_NAME'],
                                    Name: path.map(x => x.surface_form).join("/"),
                                    //Icon: doc['Icon'],
                                    //Description: doc['Description']
                                });
                                // path.forEach((token) => {
                                //     if (token.pos == "名詞") {
                                //         this.add({
                                //             $ID: doc['$ID'],
                                //             $ID_lunr: dataset + '#' + doc['$ID']+"##" ,
                                //             $ID_NAME: doc['$ID_NAME'],
                                //             Name: token.surface_form,
                                //             Icon: doc['Icon'],
                                //             Description: doc['Description']
                                //         });

                                //         iidx++;
                                //     }

                                // });
                            } else {
                                this.add({
                                    $ID: doc['$ID'],
                                    $ID_lunr: dataset + '#' + doc['$ID'],
                                    $ID_NAME: doc['$ID_NAME'],
                                    Name: doc['Name'],
                                    //Icon: doc['Icon'],
                                    //Description: doc['Description']
                                });
                            }

                        }


                    });

                });

        } else {
            Object.entries(documents)
                .forEach(value => {
                    let documents = value[1];
                    let dataset = value[0];

                    documents.forEach((doc) => {
                        this.add({
                            $ID: doc['$ID'],
                            $ID_lunr: dataset + '#' + doc['$ID'],
                            $ID_NAME: doc['$ID_NAME'],
                            Name: doc['Name'],
                            //Icon: doc['Icon'],
                            //Description: doc['Description']
                        })
                    });
                })
        }
    });
    // Save index
    log('Saving Index...');
    fs.writeFileSync(path.join(folder, 'index.json'), JSON.stringify(idx));

});