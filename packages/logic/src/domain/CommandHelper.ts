import { Command } from "./Command.js";
import * as Commands from "./commands/index.js";

export class CommandHelper {
  private static commands: Map<string, Command> = new Map();

  static {
    // 모든 커맨드 등록
    for (const CommandClass of Object.values(Commands)) {
      try {
        const instance = new (CommandClass as any)();
        if (instance.actionName) {
          this.commands.set(instance.actionName, instance);
        }
      } catch (e) {
        // 인자가 필요한 커맨드는 수동 등록이 필요할 수 있음
      }
    }
  }

  public static getCommand(actionName: string): Command | undefined {
    return this.commands.get(actionName);
  }
}
