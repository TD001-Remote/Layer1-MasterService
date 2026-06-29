import sys

with open('src/contexts/DataContext.tsx', 'rb') as f:
    d = f.read()

original = len(d)

# 1. Person imports after PendingDctChange
old = b"DCTArchiveRecord,\r\n  PendingDctChange,\r\n} from '../types';"
new = b"DCTArchiveRecord,\r\n  PendingDctChange,\r\n  Person,\r\n  PersonEntityLink,\r\n  PersonStatusLogEntry,\r\n} from '../types';"
assert old in d; d = d.replace(old, new, 1); print("1 OK")

# 2. personApi import
old = b"nonEntityApi, taxonomyApi } from '../services/api';"
new = b"nonEntityApi, taxonomyApi, personApi } from '../services/api';"
assert old in d; d = d.replace(old, new, 1); print("2 OK")

# 3. Person interface methods (showToast line ends with \n}\r\n)
old = b"showToast: (type: 'success' | 'info' | 'warning', message: string) => void;\n}\r\n"
new = (
    b"showToast: (type: 'success' | 'info' | 'warning', message: string) => void;\n"
    b"\n  // Person\n"
    b"  persons: Person[];\n"
    b"  createPerson: (data: Omit<Person, 'person_pk' | 'createdAt' | 'statusLog'>) => Promise<void>;\n"
    b"  updatePersonEntities: (personPk: string, entities: PersonEntityLink[]) => Promise<void>;\n"
    b"  addNonEntityToPerson: (personPk: string, nonEntityPk: string) => Promise<void>;\n"
    b"  removeNonEntityFromPerson: (personPk: string, nonEntityPk: string) => Promise<void>;\n"
    b"  stopPerson: (personPk: string, reason: string) => Promise<void>;\n"
    b"  recoverPerson: (personPk: string, reason: string) => Promise<void>;\n"
    b"  updatePersonParent: (personPk: string, parentPersonPk: string | null) => Promise<void>;\n"
    b"}\r\n"
)
assert old in d; d = d.replace(old, new, 1); print("3 OK")

# 4. persons state - find registryNonEntities declaration
old = b"const [registryNonEntities, setRegistryNonEntities] = useState<RegistryNonEntity[]>([]);"
new = (
    b"const [registryNonEntities, setRegistryNonEntities] = useState<RegistryNonEntity[]>([]);\r\n"
    b"\r\n  // Person\r\n"
    b"  const [persons, setPersons] = useState<Person[]>([]);"
)
assert old in d; d = d.replace(old, new, 1); print("4 OK")

# 5. load persons in initFirebase
old = b"setNonEntities(nonEntitiesData);\r\n      } catch (err) {\r\n        console.error('"
new = (
    b"setNonEntities(nonEntitiesData);\r\n\r\n"
    b"        const personsData = await personApi.getAll();\r\n"
    b"        setPersons(personsData);\r\n"
    b"      } catch (err) {\r\n        console.error('"
)
assert old in d; d = d.replace(old, new, 1); print("5 OK")

# 6. Person actions before registry methods
person_actions = (
    b"\r\n  // Person actions\r\n"
    b"  const createPerson = async (data: Omit<Person, 'person_pk' | 'createdAt' | 'statusLog'>) => {\r\n"
    b"    try {\r\n"
    b"      const person: Person = {\r\n"
    b"        ...data,\r\n"
    b"        person_pk: `PER-${String(persons.length + 1).padStart(6, '0')}`,\r\n"
    b"        createdAt: new Date().toISOString(),\r\n"
    b"        statusLog: [],\r\n"
    b"      };\r\n"
    b"      await personApi.create(person);\r\n"
    b"      setPersons((prev) => [...prev, person]);\r\n"
    b"      showToast('success', `Person '${person.name}' (${person.person_pk}) created successfully.`);\r\n"
    b"    } catch (err) {\r\n"
    b"      console.error(err);\r\n"
    b"      showToast('warning', 'Failed to create Person.');\r\n"
    b"    }\r\n"
    b"  };\r\n\r\n"
    b"  const updatePersonEntities = async (personPk: string, entities: PersonEntityLink[]) => {\r\n"
    b"    try {\r\n"
    b"      const person = persons.find(p => p.person_pk === personPk);\r\n"
    b"      if (!person) return;\r\n"
    b"      const updated = { ...person, entities };\r\n"
    b"      await personApi.update(updated);\r\n"
    b"      setPersons((prev) => prev.map(p => p.person_pk === personPk ? updated : p));\r\n"
    b"      showToast('success', `Person '${person.name}' entities updated.`);\r\n"
    b"    } catch (err) {\r\n"
    b"      console.error(err);\r\n"
    b"      showToast('warning', 'Failed to update Person entities.');\r\n"
    b"    }\r\n"
    b"  };\r\n\r\n"
    b"  const addNonEntityToPerson = async (personPk: string, nonEntityPk: string) => {\r\n"
    b"    try {\r\n"
    b"      const person = persons.find(p => p.person_pk === personPk);\r\n"
    b"      if (!person || person.non_entities.includes(nonEntityPk)) return;\r\n"
    b"      const updated = { ...person, non_entities: [...person.non_entities, nonEntityPk] };\r\n"
    b"      await personApi.update(updated);\r\n"
    b"      setPersons((prev) => prev.map(p => p.person_pk === personPk ? updated : p));\r\n"
    b"      showToast('success', `Non-Entity linked to Person '${person.name}'.`);\r\n"
    b"    } catch (err) {\r\n"
    b"      console.error(err);\r\n"
    b"      showToast('warning', 'Failed to link Non-Entity to Person.');\r\n"
    b"    }\r\n"
    b"  };\r\n\r\n"
    b"  const removeNonEntityFromPerson = async (personPk: string, nonEntityPk: string) => {\r\n"
    b"    try {\r\n"
    b"      const person = persons.find(p => p.person_pk === personPk);\r\n"
    b"      if (!person) return;\r\n"
    b"      const updated = { ...person, non_entities: person.non_entities.filter(id => id !== nonEntityPk) };\r\n"
    b"      await personApi.update(updated);\r\n"
    b"      setPersons((prev) => prev.map(p => p.person_pk === personPk ? updated : p));\r\n"
    b"      showToast('warning', `Non-Entity unlinked from Person '${person.name}'.`);\r\n"
    b"    } catch (err) {\r\n"
    b"      console.error(err);\r\n"
    b"      showToast('warning', 'Failed to unlink Non-Entity from Person.');\r\n"
    b"    }\r\n"
    b"  };\r\n\r\n"
    b"  const stopPerson = async (personPk: string, reason: string) => {\r\n"
    b"    try {\r\n"
    b"      const person = persons.find(p => p.person_pk === personPk);\r\n"
    b"      if (!person) return;\r\n"
    b"      const logEntry: PersonStatusLogEntry = { status: 'stopped', reason, changedAt: new Date().toISOString(), changedBy: 'admin' };\r\n"
    b"      await personApi.updateStatus(personPk, 'stopped', logEntry);\r\n"
    b"      setPersons((prev) => prev.map(p => p.person_pk === personPk ? { ...p, status: 'stopped', statusLog: [...p.statusLog, logEntry] } : p));\r\n"
    b"      showToast('warning', `Person '${person.name}' set to stopped.`);\r\n"
    b"    } catch (err) {\r\n"
    b"      console.error(err);\r\n"
    b"      showToast('warning', 'Failed to stop Person.');\r\n"
    b"    }\r\n"
    b"  };\r\n\r\n"
    b"  const recoverPerson = async (personPk: string, reason: string) => {\r\n"
    b"    try {\r\n"
    b"      const person = persons.find(p => p.person_pk === personPk);\r\n"
    b"      if (!person) return;\r\n"
    b"      const logEntry: PersonStatusLogEntry = { status: 'active', reason, changedAt: new Date().toISOString(), changedBy: 'admin' };\r\n"
    b"      await personApi.updateStatus(personPk, 'active', logEntry);\r\n"
    b"      setPersons((prev) => prev.map(p => p.person_pk === personPk ? { ...p, status: 'active', statusLog: [...p.statusLog, logEntry] } : p));\r\n"
    b"      showToast('success', `Person '${person.name}' successfully recovered.`);\r\n"
    b"    } catch (err) {\r\n"
    b"      console.error(err);\r\n"
    b"      showToast('warning', 'Failed to recover Person.');\r\n"
    b"    }\r\n"
    b"  };\r\n\r\n"
    b"  const updatePersonParent = async (personPk: string, parentPersonPk: string | null) => {\r\n"
    b"    try {\r\n"
    b"      const person = persons.find(p => p.person_pk === personPk);\r\n"
    b"      if (!person) return;\r\n"
    b"      const updated = { ...person, parent_person_pk: parentPersonPk };\r\n"
    b"      await personApi.update(updated);\r\n"
    b"      setPersons((prev) => prev.map(p => p.person_pk === personPk ? updated : p));\r\n"
    b"      showToast('success', `Person '${person.name}' parent link updated.`);\r\n"
    b"    } catch (err) {\r\n"
    b"      console.error(err);\r\n"
    b"      showToast('warning', 'Failed to update Person parent.');\r\n"
    b"    }\r\n"
    b"  };\r\n\r\n"
)
old = b"  // NEW: Registry methods"
assert old in d; d = d.replace(old, person_actions + old, 1); print("6 OK")

# 7. Add persons to value object
old = b"showToast,\n   };\n"
new = (
    b"showToast,\n"
    b"      persons,\n"
    b"      createPerson,\n"
    b"      updatePersonEntities,\n"
    b"      addNonEntityToPerson,\n"
    b"      removeNonEntityFromPerson,\n"
    b"      stopPerson,\n"
    b"      recoverPerson,\n"
    b"      updatePersonParent,\n"
    b"   };\n"
)
assert old in d; d = d.replace(old, new, 1); print("7 OK")

with open('src/contexts/DataContext.tsx', 'wb') as f:
    f.write(d)

print(f"Size: {original} -> {len(d)} (+{len(d)-original} bytes)")
print("DONE")
