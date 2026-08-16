import fs from 'fs'
import path from 'path'

export function loadPlugins(){
  const plugins = new Map()
  function leer(dir){
    if(!fs.existsSync(dir)) return
    for(const f of fs.readdirSync(dir)){
      const full = path.join(dir, f)
      if(fs.statSync(full).isDirectory()){ leer(full); continue }
      if(!f.endsWith('.js')) continue
      import(path.resolve(full)).then(m=>{
        const cmds = m.command || [f.replace('.js','')]
        const run = m.default
        for(const c of cmds) plugins.set(c.toLowerCase(), run)
        console.log(`✅ Fix cargado: ${c}`)
      })
    }
  }
  leer('./plugins')
  leer('./cmds')
  return plugins
}
