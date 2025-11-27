// @generated tenchat-tool: plugin-service@1.0.0 hash: initial DO NOT EDIT DIRECTLY
// Plugin framework with policy enforcement and extension capabilities

import type { 
  Plugin, 
  PluginManifest, 
  Permission, 
  HookDefinition,
  TransportDefinition,
  BotDefinition,
  SystemEvent 
} from '../../types';

export interface PluginContext {
  userId: string;
  conversationId?: string;
  permissions: Permission[];
}

export interface PluginAPI {
  messaging: {
    sendMessage: (content: string, recipientId: string) => Promise<void>;
    onMessage: (callback: (message: any) => void) => void;
  };
  storage: {
    get: (key: string) => Promise<any>;
    set: (key: string, value: any) => Promise<void>;
    delete: (key: string) => Promise<void>;
  };
  ui: {
    showNotification: (message: string, type: 'info' | 'warning' | 'error') => void;
    openModal: (content: React.ReactNode) => void;
  };
}

/**
 * Plugin security policy enforcer
 */
class PluginPolicy {
  private readonly allowedDomains = ['localhost', 'tenchat.space'];
  private readonly maxPluginSize = 5 * 1024 * 1024; // 5MB
  private readonly maxExecutionTime = 5000; // 5 seconds

  validateManifest(manifest: PluginManifest): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Validate permissions
    if (!manifest.permissions || !Array.isArray(manifest.permissions)) {
      errors.push('Invalid permissions array');
    } else {
      for (const permission of manifest.permissions) {
        if (!this.isValidPermission(permission)) {
          errors.push(`Invalid permission: ${permission.type}`);
        }
      }
    }

    // Validate hooks
    if (manifest.hooks) {
      for (const hook of manifest.hooks) {
        if (!this.isValidHook(hook)) {
          errors.push(`Invalid hook: ${hook.event}`);
        }
      }
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  private isValidPermission(permission: Permission): boolean {
    const validTypes = ['messaging', 'contacts', 'media', 'payments', 'storage'];
    return validTypes.includes(permission.type) && 
           typeof permission.description === 'string' &&
           typeof permission.required === 'boolean';
  }

  private isValidHook(hook: HookDefinition): boolean {
    const validEvents = [
      'message:received', 'message:sent', 'conversation:created',
      'user:online', 'user:offline', 'payment:received'
    ];
    return validEvents.includes(hook.event) &&
           typeof hook.handler === 'string' &&
           typeof hook.priority === 'number';
  }

  checkPermission(plugin: Plugin, permissionType: string, context: PluginContext): boolean {
    const hasPermission = plugin.manifest.permissions.some(
      p => p.type === permissionType
    );

    if (!hasPermission) {
      console.warn(`Plugin ${plugin.id} lacks permission: ${permissionType}`);
      return false;
    }

    return context.permissions.some(p => p.type === permissionType);
  }
}

/**
 * Plugin sandbox for secure execution
 */
class PluginSandbox {
  private workers: Map<string, Worker> = new Map();

  async executePlugin(plugin: Plugin, event: SystemEvent, context: PluginContext): Promise<any> {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error('Plugin execution timeout'));
      }, 5000);

      try {
        // Create isolated execution environment
        const sandbox = this.createSandboxEnvironment(plugin, context);
        
        // Execute plugin code
        const result = sandbox.execute(event);
        
        clearTimeout(timeoutId);
        resolve(result);
      } catch (error) {
        clearTimeout(timeoutId);
        reject(error);
      }
    });
  }

  private createSandboxEnvironment(plugin: Plugin, context: PluginContext) {
    // TODO(ai): Implement proper sandboxing with Web Workers or iframe
    // For now, return a mock sandbox
    return {
      execute: (event: SystemEvent) => {
        console.log(`Executing plugin ${plugin.id} for event ${event.type}`);
        return { success: true };
      }
    };
  }
}

/**
 * Main plugin service
 */
export class PluginService {
  private plugins: Map<string, Plugin> = new Map();
  private policy = new PluginPolicy();
  private sandbox = new PluginSandbox();
  private eventHooks: Map<string, HookDefinition[]> = new Map();
  private transports: Map<string, TransportDefinition> = new Map();
  private bots: Map<string, BotDefinition> = new Map();

  constructor() {
    this.loadInstalledPlugins();
  }

  /**
   * Install a new plugin
   */
  async installPlugin(manifest: PluginManifest, code: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate manifest
      const validation = this.policy.validateManifest(manifest);
      if (!validation.valid) {
        return { success: false, error: validation.errors.join(', ') };
      }

      // Create plugin object
      const plugin: Plugin = {
        id: crypto.randomUUID(),
        name: manifest.hooks[0]?.handler || 'Unknown Plugin',
        version: '1.0.0',
        author: 'Unknown',
        description: 'Plugin description',
        manifest,
        enabled: false
      };

      // Store plugin
      this.plugins.set(plugin.id, plugin);
      
      // Register hooks and extensions
      this.registerPluginHooks(plugin);
      this.registerPluginTransports(plugin);
      this.registerPluginBots(plugin);

      // Persist to storage
      this.persistPlugins();

      return { success: true };
    } catch (error) {
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Installation failed' 
      };
    }
  }

  /**
   * Enable/disable plugin
   */
  async togglePlugin(pluginId: string, enabled: boolean): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      plugin.enabled = enabled;
      
      if (enabled) {
        this.registerPluginHooks(plugin);
        this.registerPluginTransports(plugin);
        this.registerPluginBots(plugin);
      } else {
        this.unregisterPluginHooks(plugin);
        this.unregisterPluginTransports(plugin);
        this.unregisterPluginBots(plugin);
      }
      
      this.persistPlugins();
    }
  }

  /**
   * Uninstall plugin
   */
  async uninstallPlugin(pluginId: string): Promise<void> {
    const plugin = this.plugins.get(pluginId);
    if (plugin) {
      this.unregisterPluginHooks(plugin);
      this.unregisterPluginTransports(plugin);
      this.unregisterPluginBots(plugin);
      this.plugins.delete(pluginId);
      this.persistPlugins();
    }
  }

  /**
   * Execute plugin hooks for system events
   */
  async executeHooks(event: SystemEvent, context: PluginContext): Promise<void> {
    const hooks = this.eventHooks.get(event.type) || [];
    
    // Sort by priority (higher priority first)
    const sortedHooks = hooks.sort((a, b) => b.priority - a.priority);

    for (const hook of sortedHooks) {
      const plugin = Array.from(this.plugins.values()).find(p => 
        p.manifest.hooks.some(h => h === hook)
      );

      if (plugin && plugin.enabled) {
        try {
          // Check permissions
          const hasPermission = this.policy.checkPermission(
            plugin, 
            'messaging', // TODO(ai): Map event types to permissions
            context
          );

          if (hasPermission) {
            await this.sandbox.executePlugin(plugin, event, context);
          }
        } catch (error) {
          console.error(`Plugin ${plugin.id} hook execution failed:`, error);
        }
      }
    }
  }

  /**
   * Get available plugins
   */
  getAvailablePlugins(): Plugin[] {
    return Array.from(this.plugins.values());
  }

  /**
   * Get enabled plugins
   */
  getEnabledPlugins(): Plugin[] {
    return Array.from(this.plugins.values()).filter(p => p.enabled);
  }

  /**
   * Get plugin by ID
   */
  getPlugin(pluginId: string): Plugin | undefined {
    return this.plugins.get(pluginId);
  }

  /**
   * Register plugin hooks
   */
  private registerPluginHooks(plugin: Plugin): void {
    if (!plugin.manifest.hooks) return;

    for (const hook of plugin.manifest.hooks) {
      if (!this.eventHooks.has(hook.event)) {
        this.eventHooks.set(hook.event, []);
      }
      this.eventHooks.get(hook.event)!.push(hook);
    }
  }

  /**
   * Unregister plugin hooks
   */
  private unregisterPluginHooks(plugin: Plugin): void {
    if (!plugin.manifest.hooks) return;

    for (const hook of plugin.manifest.hooks) {
      const hooks = this.eventHooks.get(hook.event);
      if (hooks) {
        const index = hooks.indexOf(hook);
        if (index > -1) {
          hooks.splice(index, 1);
        }
      }
    }
  }

  /**
   * Register plugin transports
   */
  private registerPluginTransports(plugin: Plugin): void {
    if (!plugin.manifest.transports) return;

    for (const transport of plugin.manifest.transports) {
      this.transports.set(`${plugin.id}:${transport.name}`, transport);
    }
  }

  /**
   * Unregister plugin transports
   */
  private unregisterPluginTransports(plugin: Plugin): void {
    if (!plugin.manifest.transports) return;

    for (const transport of plugin.manifest.transports) {
      this.transports.delete(`${plugin.id}:${transport.name}`);
    }
  }

  /**
   * Register plugin bots
   */
  private registerPluginBots(plugin: Plugin): void {
    if (!plugin.manifest.bots) return;

    for (const bot of plugin.manifest.bots) {
      this.bots.set(`${plugin.id}:${bot.name}`, bot);
    }
  }

  /**
   * Unregister plugin bots
   */
  private unregisterPluginBots(plugin: Plugin): void {
    if (!plugin.manifest.bots) return;

    for (const bot of plugin.manifest.bots) {
      this.bots.delete(`${plugin.id}:${bot.name}`);
    }
  }

  /**
   * Create plugin API for sandbox
   */
  createPluginAPI(context: PluginContext): PluginAPI {
    return {
      messaging: {
        sendMessage: async (content: string, recipientId: string) => {
          // TODO(ai): Integrate with messaging service
          console.log(`Plugin sending message: ${content} to ${recipientId}`);
        },
        onMessage: (callback: (message: any) => void) => {
          // TODO(ai): Register message listener
          console.log('Plugin registered message listener');
        }
      },
      storage: {
        get: async (key: string) => {
          const storageKey = `plugin_${context.userId}_${key}`;
          const stored = localStorage.getItem(storageKey);
          return stored ? JSON.parse(stored) : null;
        },
        set: async (key: string, value: any) => {
          const storageKey = `plugin_${context.userId}_${key}`;
          localStorage.setItem(storageKey, JSON.stringify(value));
        },
        delete: async (key: string) => {
          const storageKey = `plugin_${context.userId}_${key}`;
          localStorage.removeItem(storageKey);
        }
      },
      ui: {
        showNotification: (message: string, type: 'info' | 'warning' | 'error') => {
          // TODO(ai): Integrate with notification system
          console.log(`Plugin notification [${type}]: ${message}`);
        },
        openModal: (content: React.ReactNode) => {
          // TODO(ai): Integrate with modal system
          console.log('Plugin opened modal');
        }
      }
    };
  }

  /**
   * Persist plugins to localStorage
   */
  private persistPlugins(): void {
    try {
      const pluginsArray = Array.from(this.plugins.entries());
      localStorage.setItem('whisperr_plugins', JSON.stringify(pluginsArray));
    } catch (error) {
      console.error('Failed to persist plugins:', error);
    }
  }

  /**
   * Load installed plugins from localStorage
   */
  private loadInstalledPlugins(): void {
    try {
      const stored = localStorage.getItem('whisperr_plugins');
      if (stored) {
        const pluginsArray = JSON.parse(stored);
        this.plugins = new Map(pluginsArray);
        
        // Re-register hooks for enabled plugins
        for (const plugin of this.plugins.values()) {
          if (plugin.enabled) {
            this.registerPluginHooks(plugin);
            this.registerPluginTransports(plugin);
            this.registerPluginBots(plugin);
          }
        }
      }
    } catch (error) {
      console.error('Failed to load installed plugins:', error);
    }
  }

  /**
   * Get available transports
   */
  getAvailableTransports(): TransportDefinition[] {
    return Array.from(this.transports.values());
  }

  /**
   * Get available bots
   */
  getAvailableBots(): BotDefinition[] {
    return Array.from(this.bots.values());
  }
}

// Service instance will be created in index.ts to avoid circular dependencies