# projetchatbotia

une application très simple tout en un pour créer un chat agentique

## architechture

* un front qui affiche un widget javascript
* un back qui a une connection à une api llm
* une documentation en ligne suceptible d'être mise à jour

## points fort du tuto

c'est une instruction donnée au llm qui détermine s'il répond de façon ordinaire ou en passant par l'agent
la documentation est téléchargée à la première question de l'usager qui la concerne

## détails

2 manières de faire de l'http.

méthode native node : 

```javascript
 const deliveryRes = await fetch('http://localhost:3001/fetchDelivery', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({message: userText, documentation: doc, sessionId })
 });
 delivery = await deliveryRes.text()

 ```

 methode axios

 ```javascript
   const response = await axios.post(GROQ_URL, {
      
      xx:yy
    });
   let botMsg = response.data.choices[0].message.content;
 ```





remarques : 

passer du temps sur l'interface, ça compte. La forme met en valeur le fond et une forme décevante est désagréable à utiliser.
exemple, le message d'attente

```javascript
   addMessage('...', 'bot');
   ...
   messages.lastChild.remove();
```
