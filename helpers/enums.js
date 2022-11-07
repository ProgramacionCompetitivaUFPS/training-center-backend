const typeCategory = {
  school: 2,
  university: 1,
  all: 3,
  getName: (id) => {
    if (id === 2) return "school"
    if (id === 1) return "university"
    if (id === 1) return "all"
    return null;
  },
};

const typeInstitution = {
  school: 1,
  university: 0,
  getName: (id) => {
    if (id === 1) return "school"
    if (id === 0) return "university"
    return null;
  },
};

const typeContest = {
  school: 1,
  university: 0,
  getName: (id) => {
    if (id == 1) return "school"
    if (id == 0) return "university"
    return null;
  },
  getNameSpanish:(id) => {
    if (id == 1) return "colegio"
    if (id == 0) return "universidad"
    return null;
  }
};

module.exports = {
    typeCategory,
    typeInstitution,
    typeContest
};
