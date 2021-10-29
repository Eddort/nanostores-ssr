import { atom } from "nanostores";
import { createTaskManager } from "./taskManager";

const get_or_create = (dest, key, getPayload) => {
  if (!dest.has(key)) dest.set(key, getPayload());
  return dest.get(key);
};

export const router = {
  queue: atom([]),
  open(route, taskId) {
    this.queue.set([...this.queue.get(), { route, taskId }]);
  },
  tasks: new Map(),
  instances: new Map(),
};

export const onRoute = (store, route, cb) => {
  router.queue.listen((messages) => {
    const target = messages[messages.length - 1];
    // todo regexp match
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
        () => new Map()
      );
      instance.set(store, res);
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
