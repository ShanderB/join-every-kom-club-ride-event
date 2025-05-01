const TARGET_URL = "https://www.kom.club/?register=true&state=&code=3bf32931c16bb587d93bb8bf2588fb3fdbacf734&scope=";

function coletarLinks(tabId) {
    // Seu código adaptado para coletar os links dos eventos
    console.log(tabId);
    return `
        (async function() {
            // Seleciona os eventos atuais
            var challengesTab = window.document.getElementById('challenges-tab');
            if (challengesTab && challengesTab.children[1] && challengesTab.children[1].children[0]) {
                challengesTab.children[1].children[0].click();
            }
            await new Promise(resolve => setTimeout(resolve, 1000));
            // Filtra eventos de bike
            var bikeFilter = window.document.getElementById('filter_bike');
            if (bikeFilter) {
                bikeFilter.click();
            }
            // Aguarda 1 segundo para garantir que o filtro foi aplicado
            await new Promise(resolve => setTimeout(resolve, 1000));
            var lista = window.document.getElementsByClassName('col-sm-6 challenge-list');
            var links = [];
            Array.from(lista).forEach(elemento => {
                let divInterna = elemento.children[0];
                const isElementoVisivel = elemento.offsetHeight;
                const isElementoCardSemAnuncio = divInterna.localName !== 'a' && !divInterna.classList.contains('col-sm-4') && !Boolean(elemento.style['padding-top']);
                if (isElementoVisivel && elemento.childElementCount == 4 && isElementoCardSemAnuncio) {
                    const link = elemento.children[0].children[0];
                    if (link.tagName === 'A' && link.href) {
                        links.push(link.href);
                    }
                }
            });
            return links;
        })();
    `;
}

browser.browserAction.onClicked.addListener(async () => {
    // Abre a página de eventos
    browser.tabs.create({ url: TARGET_URL }, function (tab) {
        // Aguarda a página carregar
        browser.tabs.onUpdated.addListener(function listener(tabId, info) {
            if (tabId === tab.id && info.status === 'complete') {
                browser.tabs.onUpdated.removeListener(listener);
                // Executa o script para coletar os links
                setTimeout(() => {

                    browser.tabs.executeScript(tab.id, {
                        code: coletarLinks(tab.id)
                    }).then(results => {


                            const links = results[0] || [];
                            console.log("Links coletados:", results);
                            // Fecha a aba de coleta
                            browser.tabs.remove(tab.id);
                            // Para cada link, abre, executa ação e fecha
                            links.forEach((url, idx) => {
                                setTimeout(() => {
                                    browser.tabs.create({ url }, function (newTab) {
                                        browser.tabs.onUpdated.addListener(function clickListener(tabId2, info2) {
                                            if (tabId2 === newTab.id && info2.status === 'complete') {
                                                browser.tabs.onUpdated.removeListener(clickListener);
                                                // Clica no botão definido
                                                browser.tabs.executeScript(newTab.id, {
                                                    code: `
                                                var btn = window.document.getElementsByClassName('Button--btn--1i5yb Button--primary--Phrgk btn-sm btn-block text-footnote ChallengeJoinButton--button--Q7s71')[0];
                                                if(btn) btn.click();
                                            `
                                                }).then(() => {
                                                    setTimeout(() => {
                                                        browser.tabs.remove(newTab.id);
                                                    }, 3000); // tempo para o botão agir
                                                });
                                            }
                                        });
                                    });
                                }, idx * 4000); // espaça as aberturas para evitar sobrecarga
                            });
                    });
                }, 1000);
            }
        });
    });
});