const hasKeysInner = (keys, obj) => {
  if (!obj) {
    return false
  }

  for (const key of keys) {
    if (!obj.hasOwnProperty(key)) {
      return false
    }
  }

  return true
}

export const hasKeys = (keys, obj) => {
  if (obj) {
    return hasKeysInner(keys, obj)
  } else {
    return (o) => hasKeysInner(keys, o)
  }
}

export const formatPhoneNumber = (phoneNumber) => {
  if (phoneNumber.startsWith('+1')) {
    return phoneNumber
  }

  return `+1${phoneNumber}`
}
