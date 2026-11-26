const store = () => typeof window !== 'undefined' ? window.sessionStorage : null;
export const sessionStorageAdapter = {
  async getItem(k:string){return store()?.getItem(k)??null;},
  async setItem(k:string,v:string){store()?.setItem(k,v);},
  async removeItem(k:string){store()?.removeItem(k);},
};
