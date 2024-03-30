const fs = require("fs").promises
const url = require("url")


const routes = {
    
"/api/upload:POST": async (req, res, next, users) => {
    const {apikey} = req.query
    const _user = await users.find({api_key: apikey})
    console.log(apikey)
    const user = await _user.toArray()
    console.log(user)
    if (user[0]) {
        const filedir = user[0].username
        try {
            let dir = await fs.readdir(`./${filedir}/`)
        }
        catch {
            await fs.mkdir(`./${filedir}/`)
        }
        console.log("yay")
        console.log(req.file)
        const filename = `${filedir}/${Date.now()}`
        await fs.writeFile(`./${filename}.${req.file.originalname.split(".").pop()}`, req.file.buffer)

        res.send({ success: true, url: `${req.protocol}://${req.hostname}/${filename}` })
    } else {
        res.send("unauthenticated")
    }

},

"/api/fetch_all:GET": async (req, res, next, users) => {
    const {apikey} = req.query
    console.log(req.query)
    console.log(apikey)
    const _user = await users.find({api_key: apikey})
    const user = await _user.toArray()
    console.log(user)
    if (user[0]) {
        try {
            var dir = await fs.readdir("./"+user[0].username)
        }
        catch (err) {
            res.end()
        }
        let new_dir = []
        dir.forEach((file) => {
            let filesplit = file.split(".")
            filesplit.pop()
            let _newdirobj = {"url": `${req.protocol}://${req.hostname}/${user[0].username}/${filesplit}`, "filename": file}
            new_dir.push(_newdirobj)
        })
        res.json(new_dir)
        
    } else {res.send("unauthenticated")}
    },

    "/api/rename:PUT": async (req,res,next,user) => {
        const {api_key, newname} = req.body
        const users = await user.find({api_key: api_key})
        const userArray = await users.toArray()
        if (userArray[0]) {
            const oldname = userArray[0].username
            fs.rename("./"+oldname, "./"+newname)
            res.send("Renamed")
            userArray[0].username = newname
        }
        else {
            res.send("unauthenticated")
        }
    },

}


const newRoutes = Object.keys(routes).reduce((accumulator, currentKey) => {
    const [newKey, newValue] = currentKey.split(":");
    accumulator[newKey] = newValue; // Assign the new value. If you want to keep the original object, use routes[currentKey] here
    return accumulator;
}, {});

console.log(newRoutes)
console.log(routes)

function functionInvoke(path, req, res, next, users) {
    const Url = new URL(path, `http://${req.get("host")}`)
    console.log(newRoutes[Url.pathname])
    console.log(req.method)
    console.log(req.method == newRoutes[Url.pathname])
    if (req.method == newRoutes[Url.pathname]) {
        return routes[Url.pathname+":"+req.method](req, res, next, users)
    }
    else {
        res.status(404).send("<h1>Unknown Endpoint</h1>")
    }
}



module.exports = (clientConnection, users) => {
    return (req, res, next) => {
        return functionInvoke(req.originalUrl, req, res, next, users)
    }
}

