/* FJ Smart Lock Card v1.0.1 — original independent Home Assistant card. MIT */
const TAG='fj-smart-lock-card';
class FJSmartLockCard extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'});this._tick=null;this._pending=null;this._notice='';}
  setConfig(config){if(!config.entity||!config.entity.startsWith('lock.'))throw Error('Choisir une entité lock.*');this.config={title:'Serrure',confirm_unlock:true,...config};this.render();}
  set hass(hass){this._hass=hass;this.render();}
  connectedCallback(){if(!this._tick)this._tick=setInterval(()=>this.render(),15000);}
  disconnectedCallback(){clearInterval(this._tick);this._tick=null;}
  getCardSize(){return 3;}
  static getConfigElement(){return document.createElement('fj-smart-lock-card-editor');}
  static getStubConfig(hass){return {entity:Object.keys(hass?.states||{}).find(x=>x.startsWith('lock.'))||'lock.porte_arriere',title:'Porte arrière',confirm_unlock:true};}
  since(s){if(!s?.last_changed)return 'durée inconnue';const m=Math.max(0,Math.floor((Date.now()-new Date(s.last_changed).getTime())/60000));if(m<1)return 'depuis moins d’une minute';if(m<60)return 'depuis '+m+' min';if(m<1440)return 'depuis '+Math.floor(m/60)+' h '+(m%60)+' min';return 'depuis '+Math.floor(m/1440)+' j '+Math.floor(m%1440/60)+' h';}
  render(){
    if(!this.shadowRoot||!this.config||!this._hass)return;
    const s=this._hass.states[this.config.entity],state=s?.state||'unavailable';
    const unlocked=state==='unlocked'||state==='open',locked=state==='locked';
    if(this._pending){
      const target=this._pending.action==='lock'?'locked':'unlocked';
      if(state===target && (this._pending.sawTransition || s?.last_changed!==this._pending.initialChanged)){
        this._pending=null;this._notice='';
      } else if(Date.now()-this._pending.started>45000){
        this._pending=null;this._notice='Confirmation non reçue après 45 secondes. Vérifiez la serrure.';
      } else if(state==='locking'||state==='unlocking'){this._pending.sawTransition=true;}
    }
    const names={locked:'Verrouillée',unlocked:'Déverrouillée',locking:'Verrouillage…',unlocking:'Déverrouillage…',jammed:'Serrure bloquée',unavailable:'Indisponible',unknown:'État inconnu',open:'Ouverte',opening:'Ouverture…'};
    const label=this._pending?(this._pending.action==='lock'?'Verrouillage en cours…':'Déverrouillage en cours…'):(names[state]||state);
    const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
    const title=esc(this.config.title||s?.attributes?.friendly_name||'Serrure');
    const waiting=!!this._pending;
    this.shadowRoot.innerHTML=`<style>
      :host{display:block}ha-card{padding:20px;border-radius:22px;color:var(--primary-text-color);background:var(--ha-card-background,var(--card-background-color,#fff));box-sizing:border-box}
      .eyebrow{font-size:11px;letter-spacing:1.5px;opacity:.6;font-weight:700}.title{font-size:21px;font-weight:700;margin:6px 0 16px}
      .panel{background:var(--secondary-background-color,#f4f5f7);border-radius:20px;padding:16px;display:flex;align-items:center;gap:16px}
      .dial{flex-shrink:0;width:142px;height:142px;border:7px solid ${waiting?'#3689c7':locked?'#35a67a':unlocked?'#d17c4a':'#aaa'};border-radius:100%;display:flex;align-items:center;justify-content:center;flex-direction:column;box-sizing:border-box;text-align:center;background:var(--card-background-color,#fff)}
      .dial svg{width:42px;height:48px;color:${waiting?'#3689c7':locked?'#24946a':unlocked?'#bb6538':'#888'}}.shackle{transform-origin:15px 16px;transition:transform .5s}.open .shackle{transform:translate(8px,-5px) rotate(25deg)}
      .wait{font-size:12px;text-align:center;margin-top:12px;color:var(--primary-text-color)}.spinner{display:inline-block;width:12px;height:12px;border:2px solid #aaa;border-top-color:#2684b8;border-radius:50%;animation:spin 1s linear infinite;vertical-align:middle;margin-right:6px}@keyframes spin{to{transform:rotate(360deg)}}.state{font-size:12px;font-weight:750;margin-top:5px}.time{font-size:10px;opacity:.75;margin-top:3px}
      .actions{flex:1;display:flex;flex-direction:column;gap:10px}button{border-radius:30px;border:1px solid var(--divider-color,#ddd);background:var(--card-background-color,#fff);color:var(--primary-text-color);padding:13px 5px;font-weight:700;cursor:pointer}button:disabled{opacity:.45;cursor:default}
      button.selected{background:${locked?'#227a58':'#a85030'};color:white}.error{font-size:12px;color:var(--error-color,#d33);margin-top:8px}
      @media(max-width:380px){.panel{gap:9px;padding:10px}.dial{width:115px;height:115px}button{font-size:12px;padding:10px 4px}}
    </style><ha-card><div class="eyebrow">FJ SMART LOCK CARD</div><div class="title">${title}</div><div class="panel"><div class="dial ${unlocked?'open':''}"><svg viewBox="0 0 40 46" fill="none"><g class="shackle"><path d="M10 21V14a10 10 0 0 1 20 0v7" stroke="currentColor" stroke-width="5" stroke-linecap="round"/></g><rect x="5" y="20" width="30" height="23" rx="5" fill="currentColor"/><circle cx="20" cy="30" r="3" fill="var(--card-background-color,#fff)"/></svg><div class="state">${esc(label)}</div><div class="time">${esc(this.since(s))}</div></div><div class="actions"><button id="lock" ${locked||waiting?'disabled':''} class="${locked?'selected':''}">🔒 Verrouiller</button><button id="unlock" ${unlocked||waiting?'disabled':''} class="${unlocked?'selected':''}">🔓 Déverrouiller</button></div></div><div class="wait" aria-live="polite">${waiting?'<span class="spinner"></span>Veuillez patienter, en attente de confirmation de Schlage.':''}</div><div class="error" id="error">${esc(this._notice)}</div></ha-card>`;
    for(const action of ['lock','unlock'])this.shadowRoot.getElementById(action).onclick=async()=>{
      if(action==='unlock'&&this.config.confirm_unlock!==false&&!confirm('Déverrouiller '+(this.config.title||'cette porte')+' ?'))return;
      this._notice='';this._pending={action,started:Date.now(),initialChanged:this._hass.states[this.config.entity]?.last_changed,sawTransition:false};this.render();
      try{await this._hass.callService('lock',action,{entity_id:this.config.entity});}catch(e){this._pending=null;this._notice='Commande échouée : '+e.message;this.render();return;}
      this.render();
    };
  }
}
if(!customElements.get(TAG))customElements.define(TAG,FJSmartLockCard);
class FJSmartLockCardEditor extends HTMLElement {
  constructor(){super();this.attachShadow({mode:'open'});}
  setConfig(c){this.config=c;this.render();}
  set hass(h){this._hass=h;this.render();}
  render(){if(!this.config||!this._hass)return;const locks=Object.keys(this._hass.states).filter(x=>x.startsWith('lock.'));this.shadowRoot.innerHTML=`<style>label{display:block;margin:12px 0 5px}select,input{padding:10px;width:100%;box-sizing:border-box}input[type=checkbox]{width:auto}</style><label>Serrure</label><select id="entity">${locks.map(x=>`<option value="${x}" ${x===this.config.entity?'selected':''}>${x}</option>`).join('')}</select><label>Nom de la porte</label><input id="title" placeholder="Porte arrière"><label><input type="checkbox" id="confirm"> Confirmer avant de déverrouiller</label>`;this.shadowRoot.getElementById('title').value=this.config.title||'';this.shadowRoot.getElementById('confirm').checked=this.config.confirm_unlock!==false;for(const id of ['entity','title','confirm'])this.shadowRoot.getElementById(id).onchange=()=>{this.dispatchEvent(new CustomEvent('config-changed',{detail:{config:{...this.config,entity:this.shadowRoot.getElementById('entity').value,title:this.shadowRoot.getElementById('title').value,confirm_unlock:this.shadowRoot.getElementById('confirm').checked}},bubbles:true,composed:true}));};}
}
if(!customElements.get('fj-smart-lock-card-editor'))customElements.define('fj-smart-lock-card-editor',FJSmartLockCardEditor);
window.customCards=window.customCards||[];
if(!window.customCards.some(c=>c.type===TAG))window.customCards.push({type:TAG,name:'FJ Smart Lock Card',description:'Carte de serrure animée, en français québécois'});
