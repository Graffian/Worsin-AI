const puppeteer = require("puppeteer")

async function ScrapePage(link) {
    const browser = await puppeteer.launch({ headless: false, executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe" })
    const page = await browser.newPage()
    try {
        await page.goto(link, { waitUntil: "networkidle2" })
        const elements = await page.$$('[role], button, input, select, textArea, a, p, h1, h2, h3, h4, h5, h6, li, ul, ol')
        const results = []
        for (const el of elements) {
            await el.evaluate(node => {
                node.style.border = "2px solid red"
                node.style.backgroundColor = 'rgba(255,0,0,0.05)'
                node.scrollIntoView({ behavior: "smooth", block: "center" })
            })
            const info = await el.evaluate(node => ({
                tag: node.tagName.toLowerCase(),
                role: node.getAttribute('role'),
                type: node.getAttribute("type"),
                name: node.getAttribute("name"),
                id: node.getAttribute('id'),
                class: node.className,
                text: node.textContent,
                ariaLabel: node.getAttribute('aria-label'),
                placeholder: node.getAttribute("placeholder")
            }))
            const fullText = `${info.text} ${info.ariaLabel} ${info.placeholder} `.toLowerCase()
            let role = 'unknown';
            if (fullText.includes('email')) role = 'email input';
            else if (fullText.includes('password')) role = 'password input';
            else if (fullText.includes('search')) role = 'search bar';
            else if (info.tag === 'button' && fullText.includes('login')) role = 'login button';
            results.push({ ...info, detectedRole: role });
            await new Promise(resolve => setTimeout(resolve, 200))
        }

        const meta = await page.evaluate(() => {
            const getMeta = name => {
                const el = document.querySelector(`meta[name='${name}']`)
                return el ? el.getAttribute('content') : null
            }
            return {
                title: document.title,
                description: getMeta('description'),
                keywords: getMeta('keywords'),
            }
        })

        const pageSummary = await page.evaluate(() => {
            const tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'p', 'li']
            return tags.map(tag => {
                return Array.from(document.querySelectorAll(tag)).map(el => el.innerText.trim()).filter(Boolean)
            }).flat().join('\n')
        })

        return { elements: results, meta, pageSummary }
    } catch (error) {
        console.error("scraping error", error)
        throw error
    } finally {
        await new Promise(resolve => setTimeout(resolve, 2000))
        await browser.close()
    }
}

module.exports = { ScrapePage }