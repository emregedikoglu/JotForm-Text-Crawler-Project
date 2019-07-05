const puppeteer = require('puppeteer');

const fs = require('fs');

const getElementTreeXPath = async (page, selector, i) => {
    var ret = await page.evaluate((selector, i) => {
        if (selector == "[class*=locale]") {
            var element = Array.from(document.getElementsByTagName('main')[0].querySelectorAll(selector));
        }
        else if (selector == ".locale-title") {
            var element = Array.from(document.querySelectorAll(selector));
        }

        var paths = [];

        // Use nodeName (instead of localName) so namespace prefix is included (if any).
        for (; element[i] && element[i].nodeType == 1; element[i] = element[i].parentNode) {
            var index = 0;
            // EXTRA TEST FOR ELEMENT.ID
            if (element[i] && element[i].id) {
                paths.splice(0, 0, '/*[@id="' + element[i].id + '"]');
                break;
            }

            for (var sibling = element[i].previousSibling; sibling; sibling = sibling.previousSibling) {
                // Ignore document type declaration.
                if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE)
                    continue;

                if (sibling.nodeName == element[i].nodeName)
                    ++index;
            }

            var tagName = element[i].nodeName.toLowerCase();
            var pathIndex = (index ? "[" + (index + 1) + "]" : "");
            paths.splice(0, 0, tagName + pathIndex);
        }

        return paths.length ? "/" + paths.join("/") : null;

    }, selector, i);
    return ret;
};

const scrollTo = async (x, y) => {
    await page.evaluate((x, y) => {
        window.scrollTo(parseInt(x || 0, 10), parseInt(y || 0, 10));
    }, x, y);
};

const disableScroll = async () => {
    await page.evaluate(() => {
        var x = window.scrollX;
        var y = window.scrollY;
        window.onscroll = function () { window.scrollTo(x, y); };
    });
};

const enableScroll = async () => {
    await page.evaluate(() => {
        window.onscroll = function () { };
    });
};

const drawCanvas = async (page, selector, i, flag) => {
    await page.evaluate((selector, i, flag) => {
        scrollTo(0, 0);

        if (selector == "[class*=locale]") {
            var canvas = document.createElement('canvas'); // eslint-disable-line no-undef  
            var element = Array.from(document.getElementsByTagName('main')[0].querySelectorAll(selector));  // eslint-disable-line no-undef
        }
        else if (selector == ".locale-title") {
            var canvas = document.createElement('canvas'); // eslint-disable-line no-undef  
            var element = Array.from(document.querySelectorAll(selector));  // eslint-disable-line no-undef    
        }

        canvas.width = element[i].getBoundingClientRect().width;
        canvas.height = element[i].getBoundingClientRect().height;
        canvas.style.border = '5px solid #F00';
        canvas.style.left = element[i].getBoundingClientRect().x + 'px';
        canvas.style.top = element[i].getBoundingClientRect().y + 'px';
        canvas.style.position = 'absolute';
        let body = document.getElementsByTagName('body')[0]; // eslint-disable-line no-undef
        body.appendChild(canvas);

        var h = element[i].getBoundingClientRect().y;

        if (selector == ".locale-title")
            h = h / 1.50;
        else if (selector == "[class*=locale]") {
            if (i >= 0 && i <= 3 && flag == 0)
                h = h / 1.40;
            else if (flag == 1)
                h = h / 1.05;
            else
                h = h / 1.10;
        }
        
        scrollTo(0, h);

    }, selector, i, flag);
};

const waitText = async (page, text) => {
    if ((await page.evaluate((text) => document.getElementsByTagName('main')[0].innerText.includes(text), text)) == false) {
        for (var i = 0; ; i++) {
            if ((await page.evaluate((text) => document.getElementsByTagName('main')[0].innerText.includes(text), text)) == true)
                break;
        }
    }
};

const removeCanvas = async (page, selector, j) => {
    await page.evaluate((selector, j) => {

        let element = Array.from(document.querySelectorAll(selector));  // eslint-disable-line no-undef        

        element[j].remove();

    }, selector, j);
};

const waitXpath = async (page, p) => {
    await page.waitForXPath(p, {
        visible: true,
    })
};

(async () => {
    const browser = await puppeteer.launch({
        headless: false,
        args: ['--start-fullscreen', '--no - sandbox', '--disable - setuid - sandbox', '--user - data - dir'], 
        defaultViewport: null,
        slowMo: 40,
    });

    const page = await browser.newPage();
    
    await page.setExtraHTTPHeaders({
        'Accept-Language': 'bn'
    });

    await page.goto('https://www.jotform.com/login/', { waitUntil: 'load', timeout: 0 });
    await page.evaluate(() => document.getElementById('username').value = ""); //zombie dilindeki user'ın username'i
    await page.evaluate(() => document.getElementById('password').value = ""); //zombie dilindeki user'ın password'ü
    await page.evaluate(() => document.getElementById('loginButton').click());
    await page.waitFor(2000);

    var pageUrl = 'https://www.jotform.com/summer-camp/';
    //var pageUrl = 'https://www.jotform.com/products/pdf-editor/';
    //var pageUrl = 'https://www.jotform.com/enterprise/';
    //var pageUrl = 'https://www.jotform.com/online-order-forms/';
    //var pageUrl = 'https://api.jotform.com/docs/'; //locale classları yok
    //var pageUrl = 'https://www.jotform.com/form-templates/';
    //var pageUrl = 'https://apps.jotform.com/'; //locale classları yok
    //var pageUrl = 'https://www.jotform.com/square/recurring-payments/'; //locale classları yok
    //var pageUrl = 'https://www.jotform.com/paypal/standard/'; //locale classları yok
    //var pageUrl = 'https://www.jotform.com/paypal/checkout/'; //locale classları yok
    //var pageUrl = 'https://www.jotform.com/form-templates/?classic';
    //var pageUrl = 'https://www.jotform.com/form-templates/?cards';
    //var pageUrl = 'https://www.jotform.com/pdf-templates/';
    //var pageUrl = 'https://www.jotform.com/theme-store/'; //locale classları yok
    //var pageUrl = 'https://www.jotform.com/products/mobile-forms/'; //locale classları yok
    //var pageUrl = 'https://www.jotform.com/hipaa/'; 
    //var pageUrl = 'https://www.jotform.com/order-forms/'; //locale classları yok(mainde yok) 
    //var pageUrl = 'https://www.jotform.com/security/';
    //var pageUrl = 'https://widgets.jotform.com/'; //locale classları yok
    //var pageUrl = 'https://www.jotform.com/contact/'; //main tag'i yok
    //var pageUrl = 'https://www.jotform.com/faq'; //locale classları yok(mainde yok)
    //var pageUrl = 'https://www.jotform.com/help'; //locale classları yok(mainde yok)
    //var pageUrl = 'https://www.jotform.com/answers'; //locale classları yok(mainde yok)
    //var pageUrl = 'https://www.jotform.com/blog/'; //locale classları yok(mainde yok)
    //var pageUrl = 'https://www.jotform.com/google-forms-alternative/';

    await page.goto(pageUrl, { waitUntil: 'load', timeout: 0 });

    var cname;

    cname = "locale";
    var texts = await page.evaluate((cname) => Array.from(document.getElementsByClassName(cname), element => element.innerText), cname);

    if (texts.length == 0) {
        cname = "locale-title";
        texts = await page.evaluate((cname) => Array.from(document.getElementsByClassName(cname), element => element.innerText), cname);
    }
    else {
        texts = await page.evaluate((cname) => Array.from(document.getElementsByTagName('main')[0].querySelectorAll('[class*=locale]'), element => element.innerText), cname);

        if (pageUrl == 'https://www.jotform.com/products/pdf-editor/') {
            var s1 = await page.evaluate(() => Array.from(document.getElementsByTagName('main')[0].getElementsByClassName('s1'), element => element.getAttribute('data-is-active')));
            var s2 = await page.evaluate(() => Array.from(document.getElementsByTagName('main')[0].getElementsByClassName('s2'), element => element.getAttribute('data-is-active')));
            var s3 = await page.evaluate(() => Array.from(document.getElementsByTagName('main')[0].getElementsByClassName('s3'), element => element.getAttribute('data-is-active')));
            var s4 = await page.evaluate(() => Array.from(document.getElementsByTagName('main')[0].getElementsByClassName('s4'), element => element.getAttribute('data-is-active')));
        }
    }

    var dname;

    if (cname == 'locale-title') {
        var dot = '.';
        dname = dot.concat(cname);
    }
    else
        dname = "[class*=locale]";

    var count = -1;

    var flag;

    if (pageUrl == 'https://www.jotform.com/security/')
        flag = 1;
    else
        flag = 0;

    var obj = [];

    var out = pageUrl.replace('https://www.jotform.com/', '');
    out = out.replace(/[/, ?]/g, '');

    for (var i = 0; i < texts.length; i++) {
        var cpath;
        cpath = await getElementTreeXPath(page, dname, i)

        if (cname == "locale") {
            await waitXpath(page, cpath);

            if (pageUrl == 'https://www.jotform.com/products/pdf-editor/') {
                if (count != -1 && count < 8) {
                    for (var k = 0; ; k++) {
                        if (count == 0 || count == 1) {
                            var s = await page.evaluate(() => Array.from(document.getElementsByTagName('main')[0].getElementsByClassName('s1'), element => element.getAttribute('data-is-active')));
                            if (s == 'true') {
                                await count++;
                                break;
                            }
                        }
                        else if (count == 2 || count == 3) {
                            var s = await page.evaluate(() => Array.from(document.getElementsByTagName('main')[0].getElementsByClassName('s2'), element => element.getAttribute('data-is-active')));
                            if (s == 'true') {
                                await count++;
                                break;
                            }
                        }
                        else if (count == 4 || count == 5) {
                            var s = await page.evaluate(() => Array.from(document.getElementsByTagName('main')[0].getElementsByClassName('s3'), element => element.getAttribute('data-is-active')));
                            if (s == 'true') {
                                await count++;
                                break;
                            }
                        }
                        else if (count == 6 || count == 7) {
                            var s = await page.evaluate(() => Array.from(document.getElementsByTagName('main')[0].getElementsByClassName('s4'), element => element.getAttribute('data-is-active')));
                            if (s == 'true') {
                                await count++;
                                break;
                            }
                        }

                    }
                }
                else if (cpath == '//*[@id="testimonials"]/div/div/div/h2') {
                    await count++;
                }
            }
        }
        else if (cname == "locale-title") {
            if (cpath == "/html/body/section[2]/div/div/div/aside/div/div/ul/li[2]/ul/li/a") {
                const linkHandler = await page.$x("//button[contains(text(), 'Industries')]");
                await linkHandler[0].click();
                await page.waitFor(1000);
            }
            else if (cpath == "/html/body/section[2]/div/div/div/aside/div/div/ul/li[3]/ul/li/a") {
                const linkHandler = await page.$x("//button[contains(text(), 'Types')]");
                await linkHandler[0].click();
                await page.waitFor(1000);
            }
            else if (i == texts.length / 2)
                break;
        }

        if (await texts[i] != '1' && texts[i] != "") {
            if (await i == 0){
                await drawCanvas(page, dname, i, flag);
            }
            else {
                await drawCanvas(page, dname, i, flag);
                await removeCanvas(page, 'canvas', 0);
            }
            
            var p = './screenshots/';
            p = p.concat(out);
            p = p.concat('-');
            p = p.concat(i);
            p = p.concat('.png');
            await page.screenshot({ path: p });

            obj.push({ file: p, text: texts[i], xpath: cpath });
        }
    }

    var myJSON = JSON.stringify(obj);

    out = out.concat('.json');

    fs.writeFile(out, myJSON, (err) => {
        // In case of a error throw err. 
        if (err) throw err;
    });

})();

