const server_i = require("ws");
const server_http = require("http");
const client_http = require("http");
const fs = require('fs');
let html_s
let html_c

const server = new server_i.Server({port:8080})

let maps = [{map:"de_dust2",pick:"",ban:""},
{map:"de_mirage",pick:"",ban:""},
{map:"de_nuke",pick:"",ban:""},
{map:"de_inferno",pick:"",ban:""},
{map:"de_train",pick:"",ban:""},
{map:"de_overpass",pick:"",ban:""},
{map:"de_vertigo",pick:"",ban:""}]
let turn=false //f - team1, t = team2
let team1="Team A";
let team2="Team B";
let logs=[];
var clients = [];
let game_type='bo1';

function reload_maps(){
    maps = [{map:"de_dust2",pick:"",ban:""},
    {map:"de_mirage",pick:"",ban:""},
    {map:"de_nuke",pick:"",ban:""},
    {map:"de_inferno",pick:"",ban:""},
    {map:"de_train",pick:"",ban:""},
    {map:"de_overpass",pick:"",ban:""},
    {map:"de_vertigo",pick:"",ban:""}]
}

server.on('connection',(ws)=>{
    var id = Math.random();
    clients[id] = ws;
    let response;
    console.log('new client')
    ws.on('message', function(message) {
        if(message == 'reload_maps'){
            reload_maps()
        }else if(message == 'reload_gt'){
            gt = 'bo1'
        }else if(message == 'reload_teams'){
            team1="Team A";
            team2="Team B";
        }else if(message == 'reload_logs'){
            logs=[];
        }else if(message == 'set_pb'){
            try{
                body = JSON.parse(message)
            }catch(err){
                body={}
            }
            if(body.maps){
                maps = body.maps
            }
            turn = !turn
        }else if(message == 'set_lobby'){
            try{
                body = JSON.parse(message)
            }catch(err){
                body={}
            }
            if(body.game_type){
                gt = body.game_type
            }
            if(body.teams){
                team1 = body.teams.team1
                team2 = body.teams.team2
            }
            turn = Boolean(Math.round(Math.random()))
        }
        response = {
            game_type: gt,
            maps: maps
        }
        for (var key in clients) {
            clients[key].send(JSON.stringify(response));
        }
    });
    
    ws.on('close', function() {
        delete clients[id];
    });
})

server_http.createServer(async function(req, res){
    if(req.method == "GET"){
        res.statusCode = 200;
        html_s = fs.readFileSync('./server_page.html','utf-8')
        res.setHeader('Content-type', 'text/html');
        res.write(html_s)
        res.end();
    }
}).listen('8181',()=>{
    console.log('SERVER http://127.0.0.1'+':'+'8181');
});

client_http.createServer(async function(req, res){
    if(req.method == "GET"){
        if(!req.url.match(/.[A-Za-z]+$/g)){
            res.statusCode = 200;
            res.setHeader('Content-type', 'text/html');
            html_c = fs.readFileSync('./client_page.html','utf-8')
            res.write(html_c)
            res.end();
        }else{
            let url_photo = './'+req.url
            let photo;
            try{
                photo = fs.readFileSync(url_photo)
                let photo_type='jpg';
                console.log(req.url)
                photo_type = req.url.match(/.[A-Za-z]+$/g)[0].replace('.','')
                res.writeHead(200, {'Content-Type': `image/${photo_type}`});
                res.write(photo);
            }catch(err){
                res.writeHead(404);
            }
            res.end();
        }
    }
}).listen('8383',()=>{
    console.log('CLIENT http://127.0.0.1'+':'+'8383');
});