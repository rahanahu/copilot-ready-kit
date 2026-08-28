type RoutingGateway = {
  lookup(routeKey: string): Promise<string>;
};

export async function resolveControlRoute(
  routeKey: string,
  gateway: RoutingGateway,
): Promise<string> {
  const normalizedKey = routeKey.trim().toLowerCase();
  return gateway.lookup(normalizedKey);
}
