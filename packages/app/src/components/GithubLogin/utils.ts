export function toParams(query: string) {
  const q = query.replace(/^\??\//, "");

  return q.split("&").reduce((values: Record<string, string | number>, param) => {
    const [key, value] = param.split("=");

    values[key] = value;

    return values;
  }, {});
}

export function toQuery(params: Record<string, string | number>, delimiter = "&") {
  const keys = Object.keys(params);

  return keys.reduce((str, key, index) => {
    let query = `${str}${key}=${params[key]}`;

    if (index < keys.length - 1) {
      query += delimiter;
    }

    return query;
  }, "");
}
