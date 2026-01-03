# Menu Realtime (exemplo)

1. Instalar dependências
   cd server
   npm install

2. Rodar em dev (com nodemon)
   npm run dev

3. Rodar em produção
   npm start

4. Endpoints
   GET  /menu
   POST /menu       { name, description, price, available }
   PUT  /menu/:id   { name?, description?, price?, available? }
   DELETE /menu/:id

5. Evento Socket.IO
   'menu-updated' -> payload: [array de itens do menu]
