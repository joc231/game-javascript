/* global teclado */

var tiles_l = [0, 1, 16, 17, 32, 33, 48, 49, 64, 65, 80, 81, 96, 97, 112, 113, 128, 129, 6, 7, 22, 23, 38, 39, 52, 53];
var tiles_b = [100, 116, 117, 132, 133, 146, 162, 163, 178, 179, 152, 168, 169, 184, 185];

var images  = {
  heroi_n: 'images/player-01-n.png', heroi_s: 'images/player-01-s.png', heroi_m: 'images/player-01-m.png', bau: 'images/bau.png',
  pote_g: 'images/pote-g.png', pote_p: 'images/pote-p.png', estrela: 'images/estrela.png', tiles_base: 'images/tiles-base.png'
};

var heroi   = {arq: images.heroi_n, x: 9, y: 0};
var pote    = {arq: images.pote_g,  x: 0, y: 6};
var estrela = {arq: images.estrela, x: 0, y: 13, tmp: 3000};
var bau     = {arq: images.bau,     x: 1, y: 4, life: 2};

var acao = {morreu: false, s_pote: false, p_estrela: false};
var game = {tela: {x: 20, y: 15}, canvas: {w: 680, h: 400}, fim: false};

function roda(){
  inicializa(carregou, processa);
 
  carrega_imagem(images.tiles_base);   
  carrega_imagem(images.heroi_n);
  carrega_imagem(images.heroi_s);
  carrega_imagem(images.heroi_m);
  carrega_imagem(images.pote_g);
  carrega_imagem(images.pote_p);
  carrega_imagem(images.estrela);
  carrega_imagem(images.bau);
  
  carrega_mapa('levels/level-01.tmx');
}

function carregou(arqs){
  if (arqs === 9) {pronto();}
}

function processa(){
  var Hbloco = {
    r: {x: heroi.x + 1, y: heroi.y, id: mapa_get_tile(heroi.x + 1, heroi.y)}, 
    l: {x: heroi.x - 1, y: heroi.y, id: mapa_get_tile(heroi.x - 1, heroi.y)},  
    d: {x: heroi.x, y: heroi.y + 1, id: mapa_get_tile(heroi.x, heroi.y + 1)},  
    u: {x: heroi.x, y: heroi.y - 1, id: mapa_get_tile(heroi.x, heroi.y - 1)}, 
    quebraveis: [193]
  };
  
  // Colisoes 
  if (!acao.morreu && !game.fim) {    
    if (teclado.left       && (tiles_l.indexOf(Hbloco.l.id) !== -1 || tiles_b.indexOf(Hbloco.l.id) !== -1)) {heroi.x--;}
    else if (teclado.right && (tiles_l.indexOf(Hbloco.r.id) !== -1 || tiles_b.indexOf(Hbloco.r.id) !== -1)) {heroi.x++;}
    else if (teclado.up    && (tiles_l.indexOf(Hbloco.u.id) !== -1 || tiles_b.indexOf(Hbloco.u.id) !== -1)) {heroi.y--;}
    else if (teclado.down  && (tiles_l.indexOf(Hbloco.d.id) !== -1 || tiles_b.indexOf(Hbloco.d.id) !== -1)) {heroi.y++;}
 
    if (teclado.space){
      if (Hbloco.l.x === bau.x && Hbloco.l.y === bau.y && !acao.s_pote && acao.p_estrela){acao.p_estrela = false; bau.life--; estrela.tmp = 8000;}
      
      if (acao.s_pote){
        // Rotina para soltar o pote e evitar que caia em um bloco solido ou em um buraco
        if ((tiles_l.indexOf(Hbloco.d.id) !== -1      && tiles_b.indexOf(Hbloco.d.id) === -1) || Hbloco.d.id === 192){pote.x = Hbloco.d.x; pote.y = Hbloco.d.y; acao.s_pote = false;}
        else if ((tiles_l.indexOf(Hbloco.l.id) !== -1 && tiles_b.indexOf(Hbloco.l.id) === -1) || Hbloco.l.id === 192){pote.x = Hbloco.l.x; pote.y = Hbloco.l.y; acao.s_pote = false;}
        else if ((tiles_l.indexOf(Hbloco.u.id) !== -1 && tiles_b.indexOf(Hbloco.u.id) === -1) || Hbloco.u.id === 192){pote.x = Hbloco.u.x; pote.y = Hbloco.u.y; acao.s_pote = false;}
        else if ((tiles_l.indexOf(Hbloco.r.id) !== -1 && tiles_b.indexOf(Hbloco.r.id) === -1) || Hbloco.r.id === 192){pote.x = Hbloco.r.x; pote.y = Hbloco.r.y; acao.s_pote = false;}
        
        if (!acao.s_pote && mapa_get_tile(pote.x, pote.y) === 192){game.fim = true; pote.x += 0.25;}else{pote.arq = images.pote_g;}
          
      } else {  // Rotina para pegar o pote
        if (heroi.x === pote.x && heroi.y === pote.y){acao.s_pote = true; }     
        // Rotina para quebrar alguns blocos em volta do heroi case não estaja em cima do pote  
        else if (Hbloco.quebraveis.indexOf(Hbloco.r.id) !== -1){mapa_set_tile(Hbloco.r.x, Hbloco.r.y, 0);}
        else if (Hbloco.quebraveis.indexOf(Hbloco.d.id) !== -1){mapa_set_tile(Hbloco.d.x, Hbloco.d.y, 0);}
        else if (Hbloco.quebraveis.indexOf(Hbloco.l.id) !== -1){mapa_set_tile(Hbloco.l.x, Hbloco.l.y, 0);}
        else if (Hbloco.quebraveis.indexOf(Hbloco.u.id) !== -1){mapa_set_tile(Hbloco.u.x, Hbloco.u.y, 0);}     
      }      
      
    }
    
    // Rotina para quando o heroi estiver segurando o pote
    if (acao.s_pote){pote.arq = images.pote_p; pote.x = heroi.x; pote.y = heroi.y + 0.3;}
    
    // Pega a estrela
    if (heroi.x === estrela.x && heroi.y === estrela.y && !acao.p_estrela){
      acao.p_estrela = true; heroi.arq = images.heroi_s;
      setTimeout(function (){
        heroi.arq = images.heroi_n; processa();
      }, estrela.tmp);
    }
    
    // Verifica se caiu no buraco
    if (tiles_b.indexOf(mapa_get_tile(heroi.x, heroi.y)) !== -1 && heroi.arq !== images.heroi_s) {acao.morreu = true;  heroi.arq = images.heroi_m;}
  
  }else{
    alert('Fim de jogo! você ' + (acao.morreu ? 'morreu.' : 'venceu.'));
  }
  
  desenha_mapa();
  desenha_imagem(heroi.arq, heroi.x, heroi.y);
  desenha_imagem(pote.arq, pote.x, pote.y);
  
  if (!acao.p_estrela){desenha_imagem(estrela.arq, estrela.x, estrela.y);}
  else if (bau.life > 0){desenha_imagem(bau.arq, bau.x, bau.y);}
}