import sys

with open('src/contexts/DataContext.tsx', 'rb') as f:
    content = f.read()

original_size = len(content)

# 1. Add Person imports
old = b"  DCTArchiveRecord,\r\n  PendingDctChange,\r\n} from '../types';"
new = b"  DCTArchiveRecord,\r\n  PendingDctChange,\r\n  Person,\r\n  PersonEntityLink,\r\n  PersonStatusLogEntry,\r\n} from '../types';"
assert old in content, "FAIL: import block not found"
content = content.replace(old, new, 1)

# 2. Add personApi import
old = b"import { geoApi, siteApi, entityApi, pendingApi, physicalAssetApi, taxonomyApi } from '../services/api';"
new = b"import { geoApi, siteApi, entityApi, pendingApi, physicalAssetApi, taxonomyApi, personApi } from '../services/api';"
assert old in content, "FAIL: api import not found"
content = content.replace(old, new, 1)

# 3. Add Person interface methods (after showToast line in interface, before closing })
old = b"    // Toast\n   showToast: (type: 'success' | 'info' | 'warning', message: string) => void;\n}"
new = b"    // Toast\n   showToast: (type: 'success' | 'info' | 'warning', message: string) => void;\n\n  // Person\n  persons: Person[];\n  createPerson: (data: Omit<Person, 'person_pk' | 'createdAt' | 'statusLog'>) => Promise<void>;\n  updatePersonEntities: (personPk: string, entities: PersonEntityLink[]) => Promise<void>;\n  addNonEntityToPerson: (personPk: string, nonEntityPk: string) => Promise<void>;\n  removeNonEntityFromPerson: (personPk: string, nonEntityPk: string) => Promise<void>;\n  stopPerson: (personPk: string, reason: string) => Promise<void>;\n  recoverPerson: (personPk: string, reason: string) => Promise<void>;\n  updatePersonParent: (personPk: string, parentPersonPk: string | null) => Promise<void>;\n}"
if old in content:
    content = content.replace(old, new, 1)
    print("3: interface OK")
else:
    print("3: FAIL - interface closing not found")

# 4. Add persons state
old = b"  const [registryNonEntities, setRegistryNonEntities] = useState<RegistryNonEntity[]>([]);"
new = b"  const [registryNonEntities, setRegistryNonEntities] = useState<RegistryNonEntity[]>([]);\r\n\r\n  // Person\r\n  const [persons, setPersons] = useState<Person[]>([]);"
if old in content:
    content = content.replace(old, new, 1)
    print("4: state OK")
else:
    print("4: FAIL - registryNonEntities state not found")

# 5. Load persons after setNonEntities
old = b"        setNonEntities(nonEntitiesData);\r\n      } catch (err) {\r\n        console.error('Firebase syncing error:"
new = b"        setNonEntities(nonEntitiesData);\r\n\r\n        const personsData = await personApi.getAll();\r\n        setPersons(personsData);\r\n      } catch (err) {\r\n        console.error('Firebase syncing error:"
if old in content:
    content = content.replace(old, new, 1)
    print("5: initFirebase OK")
else:
    print("5: FAIL - setNonEntities block not found")

# 6. Add person actions before registry methods
person_actions = b"""\r\n  // Person actions\r\n  const createPerson = async (data: Omit<Person, 'person_pk' | 'createdAt' | 'statusLog'>) => {\r\n    try {\r\n      const person: Person = {\r\n        ...data,\r\n        person_pk: `PER-${String(persons.length + 1).padStart(6, '0')}`,\r\n        createdAt: new Date().toISOString(),\r\n        statusLog: [],\r\n      };\r\n      await personApi.create(person);\r\n      setPersons((prev) => [...prev, person]);\r\n      showToast('success', `Person '${person.name}' (${person.person_pk}) created successfully.`);\r\n    } catch (err) {\r\n      console.error(err);\r\n      showToast('warning', 'Failed to create Person.');\r\n    }\r\n  };\r\n\r\n  const updatePersonEntities = async (personPk: string, entities: PersonEntityLink[]) => {\r\n    try {\r\n      const person = persons.find(p => p.person_pk === personPk);\r\n      if (!person) return;\r\n      const updated = { ...person, entities };\r\n      await personApi.update(updated);\r\n      setPersons((prev) => prev.map(p => p.person_pk === personPk ? updated : p));\r\n      showToast('success', `Person '${person.name}' entities updated.`);\r\n    } catch (err) {\r\n      console.error(err);\r\n      showToast('warning', 'Failed to update Person entities.');\r\n    }\r\n  };\r\n\r\n  const addNonEntityToPerson = async (personPk: string, nonEntityPk: string) => {\r\n    try {\r\n      const person = persons.find(p => p.person_pk === personPk);\r\n      if (!person || person.non_entities.includes(nonEntityPk)) return;\r\n      const updated = { ...person, non_entities: [...person.non_entities, nonEntityPk] };\r\n      await personApi.update(updated);\r\n      setPersons((prev) => prev.map(p => p.person_pk === personPk ? updated : p));\r\n      showToast('success', `Non-Entity linked to Person '${person.name}'.`);\r\n    } catch (err) {\r\n      console.error(err);\r\n      showToast('warning', 'Failed to link Non-Entity to Person.');\r\n    }\r\n  };\r\n\r\n  const removeNonEntityFromPerson = async (personPk: string, nonEntityPk: string) => {\r\n    try {\r\n      const person = persons.find(p => p.person_pk === personPk);\r\n      if (!person) return;\r\n      const updated = { ...person, non_entities: person.non_entities.filter(id => id !== nonEntityPk) };\r\n      await personApi.update(updated);\r\n      setPersons((prev) => prev.map(p => p.person_pk === personPk ? updated : p));\r\n      showToast('warning', `Non-Entity unlinked from Person '${person.name}'.`);\r\n    } catch (err) {\r\n      console.error(err);\r\n      showToast('warning', 'Failed to unlink Non-Entity from Person.');\r\n    }\r\n  };\r\n\r\n  const stopPerson = async (personPk: string, reason: string) => {\r\n    try {\r\n      const person = persons.find(p => p.person_pk === personPk);\r\n      if (!person) return;\r\n      const logEntry: PersonStatusLogEntry = { status: 'stopped', reason, changedAt: new Date().toISOString(), changedBy: 'admin' };\r\n      await personApi.updateStatus(personPk, 'stopped', logEntry);\r\n      setPersons((prev) => prev.map(p => p.person_pk === personPk ? { ...p, status: 'stopped', statusLog: [...p.statusLog, logEntry] } : p));\r\n      showToast('warning', `Person '${person.name}' set to stopped.`);\r\n    } catch (err) {\r\n      console.error(err);\r\n      showToast('warning', 'Failed to stop Person.');\r\n    }\r\n  };\r\n\r\n  const recoverPerson = async (personPk: string, reason: string) => {\r\n    try {\r\n      const person = persons.find(p => p.person_pk === personPk);\r\n      if (!person) return;\r\n      const logEntry: PersonStatusLogEntry = { status: 'active', reason, changedAt: new Date().toISOString(), changedBy: 'admin' };\r\n      await personApi.updateStatus(personPk, 'active', logEntry);\r\n      setPersons((prev) => prev.map(p => p.person_pk === personPk ? { ...p, status: 'active', statusLog: [...p.statusLog, logEntry] } : p));\r\n      showToast('success', `Person '${person.name}' successfully recovered.`);\r\n    } catch (err) {\r\n      console.error(err);\r\n      showToast('warning', 'Failed to recover Person.');\r\n    }\r\n  };\r\n\r\n  const updatePersonParent = async (personPk: string, parentPersonPk: string | null) => {\r\n    try {\r\n      const person = persons.find(p => p.person_pk === personPk);\r\n      if (!person) return;\r\n      const updated = { ...person, parent_person_pk: parentPersonPk };\r\n      await personApi.update(updated);\r\n      setPersons((prev) => prev.map(p => p.person_pk === personPk ? updated : p));\r\n      showToast('success', `Person '${person.name}' parent link updated.`);\r\n    } catch (err) {\r\n      console.error(err);\r\n      showToast('warning', 'Failed to update Person parent.');\r\n    }\r\n  };\r\n\r\n"""

old = b"  // NEW: Registry methods"
if old in content:
    content = content.replace(old, person_actions + old, 1)
    print("6: person actions OK")
else:
    print("6: FAIL - registry methods marker not found")

# 7. Add persons to value object
old = b"      showToast,\n   };\n"
new = b"      showToast,\n      persons,\n      createPerson,\n      updatePersonEntities,\n      addNonEntityToPerson,\n      removeNonEntityFromPerson,\n      stopPerson,\n      recoverPerson,\n      updatePersonParent,\n   };\n"
if old in content:
    content = content.replace(old, new, 1)
    print("7: value object OK")
else:
    print("7: FAIL - value object showToast not found")

print(f"Size: {original_size} -> {len(content)}")

with open('src/contexts/DataContext.tsx', 'wb') as f:
    f.write(content)

print("DONE")
