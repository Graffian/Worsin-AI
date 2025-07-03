const puppeteer = require("puppeteer")
async function ScrapePage(link){
    const broswer = await puppeteer.launch({headless:false , executablePath:"C:/Program Files/Google/Chrome/Application/chrome.exe"})
    const page = await broswer.newPage()
    try {
        await page.goto(link , {waitUntil:"networkidle2"})
        const elements = await page.$$('[role] , button , input , select , textArea , a')
        const results = []
        for ( const el of elements){
            await el.evaluate(node=>{
                node.style.border = "2px solid red"
                node.style.backgroundColor = 'rgba(255,0,0,0.05)'
                node.scrollIntoView({behavior:"smooth" , block:"center"})
            })
            const info = await el.evaluate(node=>({
                tag:node.tagName.toLowerCase(),
                role : node.getAttribute('role'),
                type : node.getAttribute("type"),
                name : node.getAttribute("name"),
                id : node.getAttribute('id'),
                class : node.className,
                text : node.textContent,
                ariaLabel : node.getAttribute('aria-label'),
                placeholder : node.getAttribute("placeholder")
            }))
            const fullText = `${info.text} ${info.ariaLabel} ${info.placeholder} `.toLowerCase()
            let role = 'unknown';
            if (fullText.includes('email')) role = 'email input';
            else if (fullText.includes('password')) role = 'password input';
            else if (fullText.includes('search')) role = 'search bar';
            else if (info.tag === 'button' && fullText.includes('login')) role = 'login button';
            results.push({ ...info, detectedRole: role });
            await new Promise(resolve=>setTimeout(resolve,500))
        }
        return results
    } catch (error) {
        console.error("scraping error" , error)
        throw error
    }finally{
        await new Promise(resolve=>setTimeout(resolve,5000))
        await broswer.close()
    }
}
module.exports = {ScrapePage}