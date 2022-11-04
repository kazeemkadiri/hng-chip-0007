const crypto = require('crypto');

const csv = require('csvtojson');

const { 
    writeFileSync, 
    existsSync, 
    mkdirSync 
} = require('fs');

const { join } = require('path');

const { parse } = require('json2csv');



const teamsCsvFilePath = join(__dirname, 'HNGi9\ CSV\ FILE\ -\ Sheet1.csv');

(async () => {

    const updatedTeamsData = [];

    const convertToCsv = () => {

        const fields = Object.keys(updatedTeamsData[0]);

        const opts = { fields };

        try {
        
            const csv = parse(updatedTeamsData, opts);

            return csv;
        } catch (err) {
            
            console.error(err);
          
        }

    }

    const generateHash = (dataToHash) => {

        return crypto.createHash('sha256').update(dataToHash).digest('hex');
    }
    
    const generateJSON = (singleTeamData) => {
        
        const teamAttributes = singleTeamData.Attributes.split(';').reduce((acc, attribute) => {
     
            const attr = attribute.split(':').map(entry => entry.trim())
     
            acc.push({
                "trait_type": attr[0],
                "value": attr[1]
            })
    
            return acc;
        }, []);

        return {
            "format": "CHIP-0007",
            "name": singleTeamData.Filename,
            "description": singleTeamData.Description,
            "minting_tool": singleTeamData['TEAM NAMES'],
            "sensitive_content": false,
            "series_number": singleTeamData['Series Number'],
            "series_total": allTeamsData.length,
            "attributes": teamAttributes,
            "UUID": singleTeamData.UUID,
            "collection": {
                name: "Zuri NFT Tickets for Free Lunch",
                id: "b774f676-c1d5-422e-beed-00ef5510c64d",
                attributes: [
                    {
                        type: "description",
                        value: "Rewards for accomplishments during HNGi9."
                    }
                ]
            }
        }
    }

    async function getCsvData () {
    
        return await csv().fromFile(teamsCsvFilePath);

    }

    const allTeamsData = await getCsvData();

    const outputJSONDir = join(__dirname, 'json-output');

    if (!existsSync(outputJSONDir)) {
        
        mkdirSync(outputJSONDir);
    
    }

    // Set the current team name to the value of the first team.
    let currentTeamName = allTeamsData[0]['TEAM NAMES'];

    allTeamsData.forEach((data, index) => {

        // This implies a new team name has been encountered and the currentTeamName's
        // value is changed to that of the new team.
        if( currentTeamName !== data['TEAM NAMES'] && data['TEAM NAMES'] !== ''){

            currentTeamName = data['TEAM NAMES'];

        } 

        data['TEAM NAMES'] = currentTeamName;

        const saveJSONFilePath = join(outputJSONDir, `${data.Filename}.json`);

        const JSONOutput = generateJSON(data);

        const hash = generateHash( JSON.stringify( JSONOutput ) );

        JSONOutput['hash'] = hash;

        updatedTeamsData.push(JSONOutput);

        // Save the JSON to file
        writeFileSync(saveJSONFilePath, JSON.stringify( JSONOutput ));

    });

    // Convert updatedTeamsData array from JSON to csv
    const csvValue = convertToCsv();
    
    const outputCsvPath = join(__dirname, 'HNGi9\ CSV\ FILE\ -\ Sheet1.output.csv');

    writeFileSync(outputCsvPath, csvValue);
 })();
