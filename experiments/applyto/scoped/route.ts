type RoutingGateway = {
  lookup(routeKey: string): Promise<string>;
};

export async function resolveScopedRoute(
  routeKey: string,
  gateway: RoutingGateway,
): Promise<string> {
  const normalizedKey = routeKey.trim().toLowerCase();
  return gateway.lookup(normalizedKey);
}
