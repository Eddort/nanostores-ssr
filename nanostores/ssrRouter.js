import { atom } from "nanostores";
import { incId } from "./incId";
import { createTaskManager } from "./taskManager";
const isBrowser = typeof window !== "undefined";

const get_or_create = (dest, key, getPayload) => {
  if (!dest.has(key)) dest.set(key, getPayload());
  return dest.get(key);
};

export const router = {
  // todo refactor to EventEmmiter
  queue: atom([]),
  open(route, params, taskId) {
    this.queue.set([...this.queue.get(), { route, taskId }]);
  },
  async load(route, params) {
    const taskId = {};
    router.open(route, params, taskId);
    return getInstances(taskId);
  },
  tasks: new Map(),
  instances: new Map(),
};

export const ssr = (store, route, cb, hydrate) => {
  if (!store.instanceId) store.instanceId = incId();

  if (isBrowser) {
    return (store.value = hydrate(store.instanceId));
  }

  router.queue.listen((messages) => {
    const target = messages[messages.length - 1];
    if (route !== target.route) return;
    const taskManager = get_or_create(
      router.tasks,
      target.taskId,
      createTaskManager
    );
    const promise = cb().then((res) => {
      const instance = get_or_create(
        router.instances,
        target.taskId,
        () => ({})
      );
      instance[store.instanceId] = res;
    });
    taskManager.task(promise);
  });
};

export const getInstances = async (taskId) => {
  const taskManager = get_or_create(router.tasks, taskId, createTaskManager);
  await taskManager.allTasks();

  const instance = router.instances.get(taskId);
  router.instances.delete(taskId);
  return instance;
};
