<script setup>
import { onMounted, ref, onUnmounted } from 'vue';
import F6 from '@antv/f6';
import TreeGraph from '@antv/f6/dist/extends/graph/treeGraph';

// Register TreeGraph
F6.registerGraph('TreeGraph', TreeGraph);

const container = ref(null);
let graph = null;
const selectedNode = ref(null);
const errorLog = ref('');

// Mock Data
const data = {
  id: 'root',
  label: '先祖祠堂',
  type: 'root-node',
  children: [
    {
      id: 'c1',
      label: '二世祠堂',
      tag: '忠贞堂',
      desc: '一世.胜 陈始祖',
      children: [
        {
          id: 'c1-1',
          label: '三世祠堂',
          tag: '忠贞堂',
          desc: '长子 陈业某',
          children: [
            {
              id: 'c1-1-1',
              label: '四世祠堂',
              tag: '忠贞堂',
              desc: '长子 陈业某',
            }
          ]
        },
         {
          id: 'c1-2',
          label: '三世祠堂',
          tag: '忠贞堂',
          desc: '次子 陈业某',
        }
      ]
    },
    {
      id: 'c2',
      label: '二十世祠堂',
      tag: '忠贞堂',
      desc: '二十世 次子 陈业某',
    }
  ]
};

// Custom Node Registration
F6.registerNode('family-node', {
  draw(cfg, group) {
    const width = 140;
    const height = 160;
    
    // Main Container
    const shape = group.addShape('rect', {
      attrs: {
        x: -width / 2,
        y: 0,
        width: width,
        height: height,
        fill: '#fffbf0',
        stroke: '#e6d5b8',
        radius: 8,
        lineWidth: 2,
      },
      name: 'main-box',
      isKeyShape: true,
    });

    // Decorative Header (Swirls placeholder)
    group.addShape('path', {
      attrs: {
        path: [
            ['M', -width / 2 + 10, 20],
            ['Q', -width / 4, 10, 0, 20],
            ['Q', width / 4, 30, width / 2 - 10, 20]
        ],
        stroke: '#cba26c',
        lineWidth: 1,
        opacity: 0.6
      },
      name: 'deco-top'
    });

    // Content: Title
    group.addShape('text', {
      attrs: {
        text: cfg.label,
        x: 0,
        y: 50,
        textAlign: 'center',
        textBaseline: 'middle',
        fill: '#333',
        fontSize: 16,
        fontWeight: 'bold',
      },
      name: 'title',
    });

    // Content: Badge (Tag)
    if (cfg.tag) {
        // Badge Background
        group.addShape('rect', {
            attrs: {
                x: -30,
                y: 65,
                width: 60,
                height: 20,
                radius: 10,
                fill: '#c29056',
            },
            name: 'badge-bg',
        });
        
        // Badge Text
        group.addShape('text', {
            attrs: {
                text: cfg.tag,
                x: 0,
                y: 75,
                textAlign: 'center',
                textBaseline: 'middle',
                fill: '#fff',
                fontSize: 10,
            },
            name: 'badge-text',
        });
    }

    // Decoration Bottom
    group.addShape('path', {
      attrs: {
        path: [
             ['M', -width / 2 + 10, height - 20],
            ['Q', 0, height - 30, width / 2 - 10, height - 20],
        ],
        stroke: '#cba26c',
        lineWidth: 1,
        opacity: 0.6
      },
      name: 'deco-bottom'
    });
    
    // Collapse Button (Only if it has children)
    if (cfg.children && cfg.children.length > 0) {
        // Draw small line down
        group.addShape('path', {
            attrs: {
                path: [
                    ['M', 0, height],
                    ['L', 0, height + 15]
                ],
                stroke: '#999',
                lineWidth: 1,
                lineDash: [2, 2]
            },
            name: 'collapse-line'
        });
        
        // Button Hit Area
         group.addShape('circle', {
            attrs: {
                x: 0,
                y: height + 15,
                r: 20,
                fill: 'transparent',
                cursor: 'pointer'
            },
            name: 'collapse-bg-hit'
        });

        // Button Circle
        group.addShape('circle', {
            attrs: {
                x: 0,
                y: height + 15,
                r: 8,
                fill: '#f4ecd8',
                stroke: '#999',
                lineWidth: 1,
                cursor: 'pointer'
            },
            name: 'collapse-bg'
        });
        
        // Button Text (+ or -)
        group.addShape('text', {
            attrs: {
                x: 0,
                y: height + 15,
                text: cfg.collapsed ? '+' : '-', 
                textAlign: 'center',
                textBaseline: 'middle',
                fill: '#666',
                fontSize: 12,
                cursor: 'pointer'
            },
            name: 'collapse-text'
        });
    }

    // Description
    if (cfg.desc) {
         // Adjust Y if collapse button exists
         const hasButton = cfg.children && cfg.children.length > 0;
         const descY = hasButton ? height + 35 : height + 15;
         
         group.addShape('text', {
            attrs: {
                text: cfg.desc,
                x: hasButton ? 0 : 0,
                y: descY,
                textAlign: 'center',
                textBaseline: 'top',
                fill: '#555',
                fontSize: 12,
            },
            name: 'desc',
        });
    }

    return shape;
  },
});

// Root Node Registration (Slightly different style)
F6.registerNode('root-node', {
  draw(cfg, group) {
     const width = 120;
    const height = 50;
    
    // Main Container
    const shape = group.addShape('rect', {
      attrs: {
        x: -width / 2,
        y: 0,
        width: width,
        height: height,
        fill: '#f4ecd8',
        stroke: '#8b6b43',
        radius: 25,
        lineWidth: 2,
      },
      name: 'root-box',
      isKeyShape: true,
    });

    group.addShape('text', {
      attrs: {
        text: cfg.label,
        x: 0,
        y: height / 2,
        textAlign: 'center',
        textBaseline: 'middle',
        fill: '#3b2e2a',
        fontSize: 18,
        fontWeight: 'bold',
      },
      name: 'root-text',
    });
    return shape;
  }
});


// Custom Edge with Collapse Button
F6.registerEdge('flow-line', {
  draw(cfg, group) {
    const startPoint = cfg.startPoint;
    const endPoint = cfg.endPoint;
    const { style } = cfg;
    
    // Check if target node is collapsed to determine symbol
    // In TreeGraph, the edge connects source to target. 
    // The collapse button usually collapses the SOURCE node's children.
    // However, F6 renders edges from Parent -> Child.
    // If the PARENT is collapsed, the edge usually isn't drawn or children aren't drawn.
    // Wait, if parent is collapsed, children are hidden.
    // So the button must be visible when expanded.
    // When we click it, we collapse the parent.
    // Meaning the node connected to the startPoint.
    // But inside 'draw', we don't have easy access to the Source Node Model directly via 'cfg' unless we look at the graph logic or pass it.
    // Actually, 'cfg.sourceNode' might be available if using G6/F6 full graph, but here it might be just data.
    // Simplify: We default to '-' because if the edge exists, the parent is expanded (children are visible).
    // If we collapse, the children disappear, and the edge disappears!
    // So where does the (+) button go?
    // It should be on the PARENT node itself, not the edge!
    
    // Ah! If I collapse a node, its outgoing edges and children are hidden.
    // So the (+) button MUST be on the Node, not the Edge.
    // PROPOSITION: Move the collapse button to the Node bottom.
    // The user's design (Fig 2) shows it on the line. 
    // This implies that perhaps the line is partially drawn? Or it's a "folded" state?
    // Usually in family trees, the button is attached to the bottom of the parent card.
    
    // However, if the user insists on the design (button on the line), 
    // when collapsed, that line segment typically shrinks or the button stays under the parent.
    // If I put it on the edge, and the edge is removed when collapsed, I can't expand it back.
    
    // I MUST move the collapse button to the Node definition (family-node).
    // It can be drawn at (x=0, y=height) relative to the node.
    // This way it persists even if children are hidden (collapsed).
    
    // Let's modify 'family-node' to include the collapse button at the bottom.
    // And remove it from 'flow-line'.
    
    // But wait, the image shows it slightly *below* the node, on the dotted line.
    // If I draw it as part of the node, I can draw a small dotted line extension downwards and then the button.
    
    // Let's revert the edge change and update the Node.
    
    const path = [
        ['M', startPoint.x, startPoint.y],
        ['L', startPoint.x, (startPoint.y + endPoint.y) / 2],
        ['L', endPoint.x, (startPoint.y + endPoint.y) / 2],
        ['L', endPoint.x, endPoint.y],
    ];

    const shape = group.addShape('path', {
      attrs: {
        stroke: '#999',
        lineWidth: 1,
        lineDash: [2, 2], // Dotted line as requested
        path: path,
        ...style,
      },
      name: 'path-shape',
    });

    return shape;
  }
});

onMounted(() => {
  try {
      console.log('F6 Version:', F6.version);
      if (!container.value) return;

      const width = container.value.scrollWidth || window.innerWidth;
      const height = container.value.scrollHeight || window.innerHeight;

      graph = new F6.TreeGraph({
        container: container.value,
        width,
        height,
        pixelRatio: window.devicePixelRatio,
        linkCenter: true,
        modes: {
          default: ['drag-canvas', 'zoom-canvas', 'drag-node'],
        },
        defaultNode: {
          type: 'family-node',
        },
        defaultEdge: {
          type: 'flow-line',
          style: {
            stroke: '#999',
          }
        },
        layout: {
          type: 'compactBox',
          direction: 'TB',
          getId: (d) => d.id,
          getHeight: () => 160,
          getWidth: () => 140,
          getVGap: () => 60,
          getHGap: () => 20,
        },
        nodeStateStyles: {
          selected: {
            stroke: '#d45d37',
            lineWidth: 3,
            shadowBlur: 10,
            shadowColor: '#d45d37',
          },
        },
      });

      graph.data(data);
      graph.render();
      graph.fitView();
      
      // Event listeners
      graph.on('collapse-bg:click', handleCollapse);
      graph.on('collapse-bg:tap', handleCollapse); // Mobile support
      graph.on('collapse-bg-hit:click', handleCollapse);
      graph.on('collapse-bg-hit:tap', handleCollapse);
      graph.on('collapse-text:click', handleCollapse);
      graph.on('collapse-text:tap', handleCollapse);
      
      // Node selection listeners
      const handleSelection = (evt) => {
        const { item } = evt;
        // Verify it is a node
        if (!item || item.getType() !== 'node') return;
        
        if (selectedNode.value && selectedNode.value !== item) {
             graph.setItemState(selectedNode.value, 'selected', false);
        }
        
        selectedNode.value = item;
        graph.setItemState(selectedNode.value, 'selected', true);
      };
      
      graph.on('node:click', handleSelection);
      graph.on('node:tap', handleSelection);
      
      const clearSelection = (e) => {
          // Check if target is canvas (not node)
          // F6 canvas click event might still pass node click?
          // Usually canvas:click means blank area
          if (selectedNode.value) {
               graph.setItemState(selectedNode.value, 'selected', false);
               selectedNode.value = null;
          }
      };
      
      graph.on('canvas:click', clearSelection);
      graph.on('canvas:tap', clearSelection);

  } catch (e) {
      console.error(e);
      errorLog.value = e.toString() + '\\n' + e.stack;
  }
});

const handleCollapse = (evt) => {
    const item = evt.item; 
    
    // Check if it's a node (since we moved buttons to node)
    if (item.getType && item.getType() === 'node') {
        const model = item.getModel();
        const collapsed = model.collapsed;
        
        graph.updateItem(item, {
            collapsed: !collapsed,
        });
        graph.layout();
    }
};

const showModal = ref(false);
const formData = ref({
    label: '',
    tag: '',
    desc: ''
});

// Add Node Functionality (Open Modal)
const addNode = () => {
    if (!selectedNode.value) {
        alert("请先选择一个上级节点 (Please select a parent node first)");
        return;
    }
    
    // Reset form
    formData.value = {
        label: '新祠堂',
        tag: '新入',
        desc: ''
    };
    showModal.value = true;
}

const confirmAddNode = () => {
    if (!formData.value.label) {
        alert("请输入名称");
        return;
    }

    const newNode = {
        id: `n-${Date.now()}`,
        label: formData.value.label,
        tag: formData.value.tag,
        desc: formData.value.desc || ' ', // ensure desc exists for spacing
        children: []
    };
    
    graph.addChild(newNode, selectedNode.value);
    
    // Explicitly refresh the parent node so it renders the new collapse button
    graph.refreshItem(selectedNode.value);
    
    showModal.value = false;
}

</script>

<template>
  <div class="tree-container" ref="container"></div>
  <div v-if="errorLog" class="error-overlay">{{ errorLog }}</div>
  
  <div class="controls">
      <button class="btn-add" @click="addNode">
        <div class="btn-bubble">
            <span>新增<br>家祠</span>
        </div>
      </button>
      <button class="btn-add">
        <div class="btn-bubble red">
            <span>申请<br>加入</span>
        </div>
      </button>
  </div>
  
  <!-- Add Node Modal -->
  <div v-if="showModal" class="modal-overlay">
      <div class="modal">
          <h3>添加新家祠</h3>
          
          <div class="form-group">
              <label>名称 (如: 五世祠堂)</label>
              <input v-model="formData.label" placeholder="请输入名称" />
          </div>
          
          <div class="form-group">
              <label>标签 (如: 忠贞堂)</label>
              <input v-model="formData.tag" placeholder="请输入标签" />
          </div>
          
          <div class="form-group">
              <label>描述 (如: 长子 陈某某)</label>
              <input v-model="formData.desc" placeholder="请输入描述" />
          </div>
          
          <div class="modal-actions">
              <button @click="showModal = false" class="btn-cancel">取消</button>
              <button @click="confirmAddNode" class="btn-confirm">确定</button>
          </div>
      </div>
  </div>
</template>

<style scoped>
.tree-container {
  width: 100vw;
  height: 100vh;
  background: transparent;
}
.error-overlay {
    position: fixed;
    top: 0;
    left: 0;
    pointer-events: none;
    z-index: 9999;
}
.controls {
    position: fixed;
    bottom: 40px;
    right: 20px;
    display: flex;
    flex-direction: column;
    gap: 15px;
}

.btn-add {
    background: transparent;
    border: none;
    padding: 0;
    cursor: pointer;
}

.btn-bubble {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #e6b980 0%, #c29056 100%);
    border-radius: 50%;
    border: 2px solid #fff;
    box-shadow: 0 4px 6px rgba(0,0,0,0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
    font-weight: bold;
    font-size: 14px;
    line-height: 1.2;
    text-align: center;
}

.btn-bubble.red {
    background: linear-gradient(135deg, #d45d37 0%, #a83d1f 100%);
}

/* Modal Styles */
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 10000;
}

.modal {
    background: #fffbf0;
    padding: 20px;
    border-radius: 12px;
    width: 80%;
    max-width: 320px;
    border: 2px solid #e6d5b8;
    box-shadow: 0 4px 12px rgba(0,0,0,0.2);
}

.modal h3 {
    margin-top: 0;
    color: #3b2e2a;
    text-align: center;
    border-bottom: 1px solid #e6d5b8;
    padding-bottom: 10px;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-size: 12px;
    color: #8b6b43;
}

.form-group input {
    width: 100%;
    padding: 8px;
    border: 1px solid #cba26c;
    border-radius: 4px;
    background: #fff;
    box-sizing: border-box; 
    /* box-sizing essential because width 100% + padding */
}

.modal-actions {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
}

.btn-cancel, .btn-confirm {
    padding: 8px 20px;
    border-radius: 20px;
    border: none;
    cursor: pointer;
    font-weight: bold;
}

.btn-cancel {
    background: #eee;
    color: #666;
}

.btn-confirm {
    background: #cba26c;
    color: white;
}
</style>
