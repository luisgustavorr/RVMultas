class pagesManager {
    constructor(page) {
        this.page = page
    }
    selectFile(){
        const target_file = require("./"+this.page+"Page")
        return target_file 
    }
}
module.exports = pagesManager
