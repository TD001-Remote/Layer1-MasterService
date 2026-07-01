import React, { useState } from "react";
import { FolderTree, MapPin as MapPinIcon, Plus } from "lucide-react";
import { NonEntity } from "../types";
import { useData } from "../contexts/DataContext";

export default function NonEntityRegistry() {
  const {
    zoneRefs,
    nonEntities,
    domains,
    categories,
    types,
    addNonEntity,
    updateNonEntity,
    stopNonEntity,
    recoverNonEntity
  } = useData();

  const onAddNonEntity = addNonEntity;
  const onUpdateNonEntity = updateNonEntity;
  const onStopNonEntity = stopNonEntity;
  const onRecoverNonEntity = recoverNonEntity;
  const [showAddNonEntity, setShowAddNonEntity] = useState(false);
  const [newNonEntity, setNewNonEntity] = useState<Partial<NonEntity>>({ visibility_type: "Public" });
  const [showStopped, setShowStopped] = useState(false);

  const visibleNonEntities = showStopped ? nonEntities.filter(n => n.status === 'stopped') : nonEntities.filter(n => n.status === 'active');

  return (
    <div className="flex flex-col h-full bg-slate-50 overflow-hidden font-sans">
      <div className="bg-white border-b border-slate-200 px-4 py-3 flex items-center justify-between shrink-0">
        <div>
          <h2 className="text-lg font-bold text-slate-800 tracking-tight font-display flex items-center gap-2">
            Non-Entity Registry
          </h2>
          <p className="text-xs text-slate-500 font-medium mt-0.5">
            Manage L4 allocated units and non-entities in the ecosystem.
          </p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowStopped(!showStopped)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${showStopped ? "bg-amber-100 text-amber-700 border-amber-200" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}
          >
            {showStopped ? "Viewing Stopped History" : "View Stopped History"}
          </button>
          <button 
            onClick={() => setShowAddNonEntity(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-nonentity-600 text-white rounded-lg text-xs font-bold hover:bg-nonentity-700 shadow-sm"
          >
            <Plus size={14} /> Add Non-Entity
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {visibleNonEntities.length === 0 ? (
          <div className="p-8 text-center text-slate-400 italic mt-10 space-y-2">
            <FolderTree size={24} className="text-slate-250 mx-auto" />
            <p className="text-[11px]">No Non-Entities found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {visibleNonEntities.map(nent => {
              const zoneMatch = zoneRefs.find(z => z.zone_pk === nent.zone_pk) || { fullAddress: "Unknown Zone" };
              return (
                <div key={nent.non_entity_pk} className="border border-rose-200 p-3 rounded-xl bg-white shadow-sm space-y-3 font-sans relative">
                  <div className="absolute top-3 right-3 bg-rose-100 text-rose-700 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase leading-none">Non-Entity</div>
                  <div>
                    <span className="font-mono bg-slate-100 text-rose-600 font-bold text-[9px] px-1.5 py-0.5 rounded leading-none border border-slate-200 shadow-sm shrink-0">
                      {nent.non_entity_pk}
                    </span>
                    <h4 className="font-bold text-slate-800 text-[13px] leading-snug mt-2 pr-16">{nent.non_entity_name}</h4>
                    <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-1 font-medium">
                      <MapPinIcon size={10} className="text-slate-400 shrink-0" />
                      <span className="truncate" title={zoneMatch.fullAddress}>{zoneMatch.fullAddress}</span>
                    </div>
                  </div>
                  <div className="pt-3 border-t border-slate-100 flex justify-end">
                    <button
                      onClick={() => {
                        if(showStopped) {
                          if(confirm(`Acknowledge: Recover Non-Entity ${nent.non_entity_name}?`)) {
                            onRecoverNonEntity(nent.non_entity_pk);
                          }
                        } else {
                          if (confirm(`Acknowledge: Stop Non-Entity ${nent.non_entity_name}?`)) {
                            onStopNonEntity(nent.non_entity_pk);
                          }
                        }
                      }}
                      className={`px-2 py-1 border text-[10px] font-bold uppercase tracking-wider shadow-sm rounded-lg transition-all ${showStopped ? 'border-nonentity-200 text-nonentity-600 hover:bg-nonentity-50' : 'border-rose-200 text-rose-600 hover:bg-rose-50'}`}
                    >
                      {showStopped ? "Recover" : "Stop Non-Entity"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showAddNonEntity && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h3 className="font-bold mb-4 font-display text-lg border-b border-slate-100 pb-3">Register Non-Entity</h3>
            <div className="space-y-3 max-h-[70vh] overflow-y-auto custom-scrollbar pr-1">
              <input type="text" placeholder="PK (e.g. NENT-000003)" value={newNonEntity.non_entity_pk || ''} onChange={e => setNewNonEntity({ ...newNonEntity, non_entity_pk: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono placeholder:font-sans" />
              <input type="text" placeholder="Name" value={newNonEntity.non_entity_name || ''} onChange={e => setNewNonEntity({ ...newNonEntity, non_entity_name: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm" />
              <input type="text" placeholder="Full Zone PK (e.g. ZONE-IN-TN-...)" value={newNonEntity.zone_pk || ''} onChange={e => setNewNonEntity({ ...newNonEntity, zone_pk: e.target.value })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm font-mono placeholder:font-sans" />
              
              <select value={newNonEntity.primary_domain || ''} onChange={e => setNewNonEntity({ ...newNonEntity, primary_domain: e.target.value as any })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option value="">-- Primary Domain --</option>
                {domains.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
              </select>
              
              <select value={newNonEntity.category_pk || ''} onChange={e => {
                const cat = categories.find(c => c.pk === e.target.value);
                setNewNonEntity({ ...newNonEntity, category_pk: e.target.value, category_name: cat ? cat.name : '' })
              }} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option value="">-- Category --</option>
                {categories.map(c => <option key={c.pk} value={c.pk}>{c.name}</option>)}
              </select>
              
              <select value={newNonEntity.visibility_type || ''} onChange={e => setNewNonEntity({ ...newNonEntity, visibility_type: e.target.value as any })} className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm">
                <option value="Public">Public</option>
                <option value="Private/Home">Private/Home</option>
              </select>
            </div>
            
            <div className="flex gap-2 justify-end pt-4 border-t border-slate-100 mt-5">
              <button onClick={() => setShowAddNonEntity(false)} className="px-4 py-2 rounded-lg border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">Cancel</button>
              <button 
                onClick={() => { 
                  if(newNonEntity.non_entity_pk && newNonEntity.non_entity_name) { 
                    onAddNonEntity({ 
                      ...newNonEntity, 
                      createdAt: new Date().toISOString(), 
                      updatedAt: new Date().toISOString() 
                    } as NonEntity); 
                    setShowAddNonEntity(false); 
                  } 
                }} 
                className="px-4 py-2 bg-nonentity-600 text-white rounded-lg text-sm font-bold hover:bg-nonentity-700 shadow-sm"
              >
                Register Non-Entity
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
